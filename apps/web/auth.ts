import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { postgrest } from "./lib/postgrest";
import { getUserSessionDTO } from "./lib/dto";
import { getAllowedPaths } from "./lib/server-utils";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      name: "Sign in",
      id: "credentials",
      credentials: {
        email: {
          label: "email",
          type: "email",
          placeholder: "example@gmail.com",
        },
        password: {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Enter Password",
        },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const { data: user } = await postgrest
          .asAdmin()
          .from("user_catalog")
          .select("*")
          .eq("user_email", credentials.email as string)
          .eq("password", credentials.password as string)
          .single();

        if (!user) {
          return null;
        }

        const userSessionDTO = getUserSessionDTO(user);
        const allowedPaths = await getAllowedPaths(userSessionDTO);
        return { ...userSessionDTO, allowedPaths: allowedPaths };
      },
    }),
    Credentials({
      name: "Login with Email",
      id: "user-email",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter Email",
        },
      },
      authorize: async (credentials) => {
        console.log("Login with User ID", credentials);
        if (!credentials?.email) {
          return null;
        }

        const { data: user } = await postgrest
          .asAdmin()
          .from("user_catalog")
          .select("*")
          .eq("user_email", credentials.email as string)
          .single();

        console.log("user", user);

        if (!user) {
          return null;
        }

        const userSessionDTO = getUserSessionDTO(user);
        const allowedPaths = await getAllowedPaths(userSessionDTO);
        return { ...userSessionDTO, allowedPaths: allowedPaths };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const ignorePathsRegex =
        /^\/(api|_next\/static|_next\/image|favicon\.ico|sitemap\.xml|robots\.txt)/;
      if (ignorePathsRegex.test(nextUrl.pathname)) {
        return true;
      }

      // Shopify install/auth redirect
      if (
        nextUrl.pathname === "/" &&
        nextUrl.searchParams.has("hmac") &&
        nextUrl.searchParams.has("shop")
      ) {
        const redirectUrl = new URL("/api/shopify/auth", nextUrl.origin);
        for (const [key, value] of nextUrl.searchParams.entries()) {
          redirectUrl.searchParams.append(key, value);
        }
        // Create a new Headers object with the cookies
        const headers = new Headers();
        headers.append(
          "Set-Cookie",
          `shopify_app_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
        );
        headers.append(
          "Set-Cookie",
          `shopify_app_state.sig=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
        );
        headers.set("Location", redirectUrl.toString());
        return new Response(null, {
          status: 302,
          headers,
        });
      }

      const isLoggedIn = !!auth?.user;
      const publicPaths = [
        "/sign-in",
        "/sign-up",
        "/storesignin",
        "/storesignup",
        "/langchain-chat/share",
      ];

      const isPublic = publicPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      if (!isLoggedIn) {
        if (!isPublic) {
          const redirectUrl = new URL("/sign-in", nextUrl.origin);
          redirectUrl.searchParams.append("callbackUrl", nextUrl.href);
          return Response.redirect(redirectUrl);
        } else {
          return true;
        }
      }

      if (
        isLoggedIn &&
        ["/sign-in", "/sign-up", "/storesignin", "/storesignup"].some((path) =>
          nextUrl.pathname.startsWith(path)
        )
      ) {
        // Check if there's a callbackUrl parameter
        const callbackUrl = nextUrl.searchParams.get("callbackUrl");
        if (callbackUrl) {
          try {
            // Validate that the callback URL is safe (same origin or relative)
            const callback = new URL(callbackUrl);
            if (callback.origin === nextUrl.origin) {
              return Response.redirect(new URL(callbackUrl));
            }
          } catch {
            // If URL parsing fails, fall back to default
          }
        }
        return Response.redirect(new URL("/role-menu", nextUrl.origin));
      }

      const authAllowedPaths = ["/role-menu", "/settings", "/not-authorized"];

      const isAuthAllowedPaths = authAllowedPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );
      // if (
      //   !isAuthAllowedPaths &&
      //   !(auth?.user?.allowedPaths || []).some((path) =>
      //     nextUrl.pathname.startsWith(path)
      //   )
      // ) {
      //   if (process.env.STAGE === "dev") return true;
      //   console.log(
      //     "its not allwed page",
      //     nextUrl.pathname,
      //     "routes",
      //     auth?.user
      //   );
      //   return Response.redirect(new URL("/not-authorized", nextUrl.origin));
      // }

      return true;
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as unknown as any;
        return {
          ...token,
          id: u.id,
          randomKey: u.randomKey,
          user: u,
        };
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          ...(token.user as any),
          id: token.id as string,
          randomKey: token.randomKey,
        },
      };
    },
  },
});
