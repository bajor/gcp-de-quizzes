import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";
import { App } from "./App";
import { answerQuestion, completeAttempt, createAttempt, saveAttempt } from "./domain/attempt";
import { fixtureQuestionSet } from "./test/fixtures";

beforeEach(() => localStorage.clear());

it("starts an available practice exam", async () => {
  const user = userEvent.setup();
  render(<App questionSet={fixtureQuestionSet} />);
  await user.click(screen.getByRole("button", { name: "Start practice exam" }));
  expect(screen.getByRole("heading", { name: "Which fixture answer is correct?" })).toBeVisible();
});

it("focuses the first question heading after start", async () => {
  const user = userEvent.setup();
  render(<App questionSet={fixtureQuestionSet} />);
  await user.click(screen.getByRole("button", { name: "Start practice exam" }));
  expect(screen.getByRole("heading", { name: "Which fixture answer is correct?" })).toHaveFocus();
});

it("focuses a newly navigated question heading", async () => {
  const user = userEvent.setup();
  render(<App questionSet={fixtureQuestionSet} />);
  await user.click(screen.getByRole("button", { name: "Start practice exam" }));
  await user.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByRole("heading", { name: "Which two fixture answers are correct?" })).toHaveFocus();
});

it("submits answers and displays the exact score", async () => {
  const user = userEvent.setup();
  render(<App questionSet={fixtureQuestionSet} />);
  await user.click(screen.getByRole("button", { name: "Start practice exam" }));
  await user.click(screen.getByRole("radio", { name: /Correct$/ }));
  await user.click(screen.getByRole("button", { name: "Finish exam" }));
  await user.click(screen.getByRole("button", { name: "Submit answers" }));
  expect(screen.getByRole("heading", { name: "50.0%" })).toBeVisible();
});

it("labels the candidate's selected answer in results", () => {
  const answered = answerQuestion(createAttempt(fixtureQuestionSet), fixtureQuestionSet.questions[0], "a");
  saveAttempt(completeAttempt(answered));
  render(<App questionSet={fixtureQuestionSet} />);
  expect(screen.getByText(/Your answer/)).toBeVisible();
});

it("labels correct answers in results", () => {
  saveAttempt(completeAttempt(createAttempt(fixtureQuestionSet)));
  render(<App questionSet={fixtureQuestionSet} />);
  expect(screen.getAllByText("Correct answer")).not.toHaveLength(0);
});

it("links result evidence to its cited source", () => {
  saveAttempt(completeAttempt(createAttempt(fixtureQuestionSet)));
  render(<App questionSet={fixtureQuestionSet} />);
  expect(screen.getAllByRole("link", { name: "Google Cloud documentation" })[0]).toHaveAttribute(
    "href",
    "https://docs.cloud.google.com/docs",
  );
});

it("restores the saved question position", () => {
  const attempt = { ...createAttempt(fixtureQuestionSet), currentQuestionIndex: 1 };
  saveAttempt(attempt);
  render(<App questionSet={fixtureQuestionSet} />);
  expect(screen.getByRole("heading", { name: "Which two fixture answers are correct?" })).toBeVisible();
});

it("discards malformed browser storage", () => {
  localStorage.setItem("pde-practice-attempt-v1", "not-json");
  render(<App questionSet={fixtureQuestionSet} />);
  expect(screen.getByRole("button", { name: "Start practice exam" })).toBeVisible();
});

it("completes a restored expired attempt", () => {
  saveAttempt(createAttempt(fixtureQuestionSet, 0));
  render(<App questionSet={fixtureQuestionSet} />);
  expect(screen.getByRole("heading", { name: "0.0%" })).toBeVisible();
});

it("restores a completed result", () => {
  const answered = answerQuestion(createAttempt(fixtureQuestionSet), fixtureQuestionSet.questions[0], "a");
  saveAttempt(completeAttempt(answered));
  render(<App questionSet={fixtureQuestionSet} />);
  expect(screen.getByText("1 of 2 questions correct")).toBeVisible();
});

it("focuses the score heading when results appear", () => {
  saveAttempt(completeAttempt(createAttempt(fixtureQuestionSet)));
  render(<App questionSet={fixtureQuestionSet} />);
  expect(screen.getByRole("heading", { name: "0.0%" })).toHaveFocus();
});

it("disables additional choices at the multiple-select limit", async () => {
  const user = userEvent.setup();
  render(<App questionSet={fixtureQuestionSet} />);
  await user.click(screen.getByRole("button", { name: "Start practice exam" }));
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.click(screen.getByRole("checkbox", { name: /Correct A/ }));
  await user.click(screen.getByRole("checkbox", { name: /Correct C/ }));
  expect(screen.getByRole("checkbox", { name: /Wrong E/ })).toBeDisabled();
});

it("reports the unanswered count before submission", async () => {
  const user = userEvent.setup();
  render(<App questionSet={fixtureQuestionSet} />);
  await user.click(screen.getByRole("button", { name: "Start practice exam" }));
  await user.click(screen.getByRole("button", { name: "Mark for review" }));
  await user.click(screen.getByRole("button", { name: "Finish exam" }));
  expect(screen.getByText(/^2 unanswered/)).toBeVisible();
});

it("reports the marked count before submission", async () => {
  const user = userEvent.setup();
  render(<App questionSet={fixtureQuestionSet} />);
  await user.click(screen.getByRole("button", { name: "Start practice exam" }));
  await user.click(screen.getByRole("button", { name: "Mark for review" }));
  await user.click(screen.getByRole("button", { name: "Finish exam" }));
  expect(screen.getByText(/1 marked for review\.$/)).toBeVisible();
});

it("confirms before replacing a completed result", async () => {
  const user = userEvent.setup();
  saveAttempt(completeAttempt(createAttempt(fixtureQuestionSet)));
  render(<App questionSet={fixtureQuestionSet} />);
  await user.click(screen.getByRole("button", { name: "Start a new attempt" }));
  expect(screen.getByRole("dialog", { name: "Replace this result?" })).toBeVisible();
});
