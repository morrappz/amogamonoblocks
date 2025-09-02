import { test, expect } from "@playwright/test";

test("View AI Settings Form", async ({ page }) => {
  await page.goto("http://localhost:3000/sign-in");
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("tharun@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("55555555");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("link", { name: "Role Menu" }).click();
  await page.getByRole("link", { name: "Store Settings" }).click();
  await page.getByRole("tab", { name: "AI APIs" }).click();
  await page
    .getByRole("tabpanel", { name: "AI APIs" })
    .getByRole("button")
    .click();
  //   await page.getByRole("button", { name: "Save" }).click();
});
