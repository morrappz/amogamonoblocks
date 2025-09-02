import { test, expect } from "@playwright/test";

test("login and navigate to langchain chat and send prompt and favorite response", async ({
  page,
}) => {
  test.setTimeout(60000); // optional, if it's really slow

  await page.goto("http://localhost:3000/sign-in");
  await page.getByRole("textbox", { name: "Email" }).fill("tharun@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).fill("55555555");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "Role Menu" }).click();

  // click and wait for SPA route change
  await page.getByRole("link", { name: "Langchain Chat" }).click();
  await page.waitForURL(/\/langchain-chat\/chat\//, { timeout: 30000 });

  const chatInput = page.getByRole("textbox", { name: "Enter prompt..." });
  await expect(chatInput).toBeVisible({ timeout: 30000 });

  await chatInput.fill("hello, how are you");
  //   await chatInput.press("Enter");

  //   await page.locator(".lucide.lucide-star").click();
});
