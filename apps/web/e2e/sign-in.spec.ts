import { test, expect } from "@playwright/test";

// test("Login Successful", async ({ page }) => {
//   await page.goto("http://localhost:3000/sign-in");
//   await page.getByRole("textbox", { name: "Email" }).click();
//   await page.getByRole("textbox", { name: "Email" }).fill("tharun@gmail.com");
//   await page.getByRole("textbox", { name: "Password" }).click();
//   await page.getByRole("textbox", { name: "Password" }).fill("55555555");
//   await page.getByRole("button", { name: "Login" }).click();
//   await page.getByRole("link", { name: "Role Menu" }).click();
// });

test("Login Failed, Invalid credentials", async ({ page }) => {
  await page.goto("http://localhost:3000/sign-in");

  await page.getByRole("textbox", { name: "Email" }).click();
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("invalid@example.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("wrongpassword");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByText("Invalid credentials!")).toBeVisible();
});
