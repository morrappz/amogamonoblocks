import { test, expect } from "@playwright/test";

test.describe("Sign Up Page", () => {
  test("should render all UI elements", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(
      page.getByRole("heading", { name: /create an account/i })
    ).toBeVisible();
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Last Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Mobile")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByLabel("Confirm Password")).toBeVisible();
    await expect(page.getByLabel("Business Name")).toBeVisible();
    await expect(page.getByLabel("Business Number")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /create account/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /github/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /facebook/i })).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/first name is required/i)).toBeVisible();
    await expect(page.getByText(/last name is required/i)).toBeVisible();
    await expect(page.getByText(/please enter your email/i)).toBeVisible();
    await expect(page.getByText(/please enter your username/i)).toBeVisible();
    await expect(page.getByText(/mobile number is required/i)).toBeVisible();
    await expect(page.getByText(/please enter your password/i)).toBeVisible();
    await expect(page.getByText(/business name is required/i)).toBeVisible();
    await expect(page.getByText(/business number is required/i)).toBeVisible();
  });

  test("should show error for invalid email format", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });

  test("should show error for short username", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Username").fill("usr");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(
      page.getByText(/username must be at least 5 characters long/i)
    ).toBeVisible();
  });

  test("should show error for invalid mobile number", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Mobile").fill("123");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/invalid mobile number format/i)).toBeVisible();
  });

  test("should show error for non-numeric business number", async ({
    page,
  }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Business Number").fill("abcde");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(
      page.getByText(/business number must be numeric/i)
    ).toBeVisible();
  });

  test("should show error for short password", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(
      page.getByText(/password must be at least 7 characters long/i)
    ).toBeVisible();
  });

  test("should show error for password mismatch", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Password").fill("password123");
    await page.getByLabel("Confirm Password").fill("password321");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/passwords don't match/i)).toBeVisible();
  });

  test("should navigate to sign-in page", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL("/sign-in");
  });

  test("should allow social login buttons to be clicked", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByRole("button", { name: /github/i }).click();
    await page.getByRole("button", { name: /facebook/i }).click();
    // Add more checks if these buttons trigger modals or redirects
  });
});
