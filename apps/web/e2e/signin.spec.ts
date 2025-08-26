import { test, expect } from "@playwright/test";

test.describe("Sign In Page", () => {
  test("should render all UI elements", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /forgot password/i })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /github/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /facebook/i })).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page.getByText(/please enter your email/i)).toBeVisible();
    await expect(page.getByText(/please enter your password/i)).toBeVisible();
  });

  test("should show error for invalid email format", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });

  test("should show error for short password", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: /login/i }).click();
    await expect(
      page.getByText(/password must be at least 7 characters long/i)
    ).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test("should navigate to sign-up page", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/sign-up");
  });

  test("should navigate to forgot password (if implemented)", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByRole("link", { name: /forgot password/i }).click();
    // If you have a forgot password page, check its URL or content
    // await expect(page).toHaveURL('/forgot-password');
  });

  test("should allow social login buttons to be clicked", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("button", { name: /github/i }).click();
    await page.getByRole("button", { name: /facebook/i }).click();
    // You can add more checks if these buttons trigger modals or redirects
  });
});
