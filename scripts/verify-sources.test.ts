import { expect, it } from "vitest";
import { candidateQuestionSets } from "../src/data/questionSets";
import { validateQuestionSets } from "../src/domain/questions";

it("validates candidate sets and fetches every evidence URL", async () => {
  expect(validateQuestionSets(candidateQuestionSets)).toEqual([]);

  const urls = new Set(
    candidateQuestionSets.flatMap((questionSet) =>
      questionSet.questions.flatMap((question) => question.evidence.map((source) => source.url)),
    ),
  );
  const results = await Promise.all(
    [...urls].map(async (url) => {
      try {
        const response = await fetch(url, { redirect: "follow" });
        return response.ok ? null : `${url}: HTTP ${response.status}`;
      } catch (error) {
        return `${url}: ${error instanceof Error ? error.message : "request failed"}`;
      }
    }),
  );
  expect(results.filter((result) => result !== null)).toEqual([]);
});
