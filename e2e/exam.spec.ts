import { expect, test } from "@playwright/test";

test("shows the evidence-review gate before activation", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Documentation-backed practice exam" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("independent documentation review");
});

test("does not overflow the configured viewport", async ({ page }) => {
  await page.goto("./");
  const fitsViewport = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fitsViewport).toBe(true);
});

test("completes and reviews a marked practice attempt", async ({ page }) => {
  await page.goto("http://127.0.0.1:4174/gcp-de-quizzes/e2e/harness.html");
  await page.getByRole("button", { name: "Start practice exam" }).click();
  await page.getByRole("radio", { name: /Correct$/ }).check();
  await page.getByRole("button", { name: "Mark for review" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("checkbox", { name: /Correct A/ }).check();
  await page.getByRole("checkbox", { name: /Correct C/ }).check();
  await page.getByRole("button", { name: "Finish exam" }).click();
  await expect(page.getByText("0 unanswered and 1 marked for review.")).toBeVisible();
  await page.getByRole("button", { name: "Submit answers" }).click();
  await expect(page.getByRole("heading", { name: "100.0%" })).toBeVisible();
  await expect(page.getByText("Your answer / Correct answer").first()).toBeVisible();
  await page.getByText(/Google Cloud sources, verified/).first().click();
  await expect(page.getByRole("link", { name: "Google Cloud documentation" }).first()).toBeVisible();
});

test("restores the current question after reload", async ({ page }) => {
  await page.goto("http://127.0.0.1:4174/gcp-de-quizzes/e2e/harness.html");
  await page.getByRole("button", { name: "Start practice exam" }).click();
  await page.getByRole("radio", { name: /Correct$/ }).check();
  await page.getByRole("button", { name: "Next" }).click();
  const originalDeadline = await page.evaluate(() => JSON.parse(localStorage.getItem("pde-practice-attempt-v1")!).deadline);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Which two fixture answers are correct?" })).toBeVisible();
  const restoredDeadline = await page.evaluate(() => JSON.parse(localStorage.getItem("pde-practice-attempt-v1")!).deadline);
  expect(restoredDeadline).toBe(originalDeadline);
  await page.getByRole("button", { name: "Question 1, answered" }).click();
  await expect(page.getByRole("radio", { name: /Correct$/ })).toBeChecked();
});

test("places current-question controls before the question navigator in keyboard order", async ({ page }) => {
  await page.goto("http://127.0.0.1:4174/gcp-de-quizzes/e2e/harness.html");
  await page.getByRole("button", { name: "Start practice exam" }).click();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Mark for review" })).toBeFocused();
});

test("keeps attempt controls within the configured viewport", async ({ page }) => {
  await page.goto("http://127.0.0.1:4174/gcp-de-quizzes/e2e/harness.html");
  await page.getByRole("button", { name: "Start practice exam" }).click();
  const fitsViewport = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fitsViewport).toBe(true);
});

test("supports keyboard cancellation of submission", async ({ page }) => {
  await page.goto("http://127.0.0.1:4174/gcp-de-quizzes/e2e/harness.html");
  await page.getByRole("button", { name: "Start practice exam" }).click();
  await page.getByRole("button", { name: "Finish exam" }).click();
  await expect(page.getByRole("button", { name: "Keep working" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("button", { name: "Finish exam" })).toBeFocused();
});
