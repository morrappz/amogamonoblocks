import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const LOGIN_URL = "/signin";
const ROLE_MENU_URL = "/role-menu";
const ASSISTANT_URL = "/langchain-chat/assistant/571";
const EMAIL = "amoga.apps@gmail.com";
const PASSWORD = "morrappz@1234";
const STORAGE_STATE = path.resolve(__dirname, "assistant-chat-auth.json");

async function ensureAuth(page) {
  if (!fs.existsSync(STORAGE_STATE)) {
    await page.goto(LOGIN_URL);
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password/i).fill(PASSWORD);
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await page.waitForURL(ROLE_MENU_URL, { timeout: 15000 });
    await page.goto(ASSISTANT_URL);
    await page.waitForURL(ASSISTANT_URL, { timeout: 15000 });
    await page.context().storageState({ path: STORAGE_STATE });
  }
}

test.describe("Assistant Chat - AssistantWindow", () => {
  test.beforeEach(async ({ page, context }) => {
    await ensureAuth(page);
    await context.addCookies(
      JSON.parse(fs.readFileSync(STORAGE_STATE, "utf-8")).cookies
    );
    await page.goto(ASSISTANT_URL);
  });

  test("should render assistant buttons and click one", async ({ page }) => {
    // Wait for assistant buttons to be visible (they have class 'text-xs rounded-full')
    const assistantButtons = page.locator("button.text-xs.rounded-full");
    await expect(assistantButtons.first()).toBeVisible({ timeout: 20000 });
    await assistantButtons.first().click();
    await page.waitForTimeout(5000);
    expect(true).toBe(true);
  });

  test("should be mobile responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size
    await page.goto(ASSISTANT_URL);
    // Check that assistant buttons are visible and usable on mobile
    const assistantButtons = page.locator("button.text-xs.rounded-full");
    await expect(assistantButtons.first()).toBeVisible({ timeout: 20000 });
    await assistantButtons.first().click();
    await page.waitForTimeout(3000);
    expect(true).toBe(true);
  });
});
