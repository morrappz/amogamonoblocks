import { test, expect } from "@playwright/test";

// ------------------- page load without runtime errors ---------------------------
test("Langchain chat page render", async ({ page }) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  await page.goto("http://localhost:3000/sign-in");
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("tharun@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("55555555");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("link", { name: "Role Menu" }).click();
  const renderLangchainPage = await page.getByRole("link", {
    name: "Langchain Chat",
  });
  await renderLangchainPage.click();
  await expect(renderLangchainPage).toBeVisible({ timeout: 150000 });
  await expect(errors).toHaveLength(0);
});

// ----------------------------- chat ui components render correctly -----------------------------

test.only("Langchain chat page components render", async ({ page }) => {
  test.setTimeout(60000);

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
  await expect(page.locator("form").getByRole("button")).toBeVisible();
  await expect(
    page.getByRole("combobox").filter({ hasText: "mistral-large-latest" })
  ).toBeVisible();
  //   await expect(page.getByText(/Hello/i)).toBeVisible();
  await expect(page.locator('input[type="text"]')).toBeVisible();
});

// ----------------------- initial state rendering (initial greeting message)---------------------

// ----------------------- Environment variables rendering----------------------------

test("print environment variables after navigating to Langchain Chat", async ({
  page,
}) => {
  // optional: increase timeout
  test.setTimeout(60000);

  // Go to login page
  await page.goto("http://localhost:3000/sign-in");

  // Fill in login credentials
  await page.getByRole("textbox", { name: "Email" }).fill("tharun@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).fill("55555555");
  await page.getByRole("button", { name: "Login" }).click();

  // Navigate to Role Menu → Langchain Chat
  await page.getByRole("link", { name: "Role Menu" }).click();
  await page.getByRole("link", { name: "Langchain Chat" }).click();
  await page.waitForURL(/\/langchain-chat\/chat\//, { timeout: 30000 });

  console.log("key---", process.env.NEXT_PUBLIC_APP_URL);
  console.log("key---", process.env.NEXT_PUBLIC_SUPABASE_URL);
});

// Error boundary in rendering
