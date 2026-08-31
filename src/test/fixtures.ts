import {
  type Choice,
  type Evidence,
  type QuestionSet,
  type SingleChoiceQuestion,
} from "../domain/questions";

const evidence: Evidence = {
  id: "source",
  title: "Google Cloud documentation",
  url: "https://docs.cloud.google.com/docs",
  claim: "Fixture evidence.",
};

function choice(id: Choice["id"], text: string): Choice {
  return { id, text, feedback: `${text} feedback.`, evidenceIds: [evidence.id] };
}

export const singleQuestion = {
  id: "fixture-q1",
  kind: "single",
  section: "design",
  objective: "Fixture objective",
  prompt: "Which fixture answer is correct?",
  verifiedOn: "2026-08-31",
  evidence: [evidence],
  choices: [choice("a", "Correct"), choice("b", "Wrong B"), choice("c", "Wrong C"), choice("d", "Wrong D")],
  correctChoiceId: "a",
} satisfies SingleChoiceQuestion;

export const multipleQuestion = {
  id: "fixture-q2",
  kind: "multiple",
  requiredSelections: 2,
  section: "ingest",
  objective: "Fixture multiple objective",
  prompt: "Which two fixture answers are correct?",
  verifiedOn: "2026-08-31",
  evidence: [evidence],
  choices: [
    choice("a", "Correct A"),
    choice("b", "Wrong B"),
    choice("c", "Correct C"),
    choice("d", "Wrong D"),
    choice("e", "Wrong E"),
  ],
  correctChoiceIds: ["a", "c"],
} as const;

export const fixtureQuestionSet: QuestionSet = {
  id: "fixture-set",
  version: 1,
  title: "Fixture set",
  guideVersion: "4.2",
  durationMinutes: 120,
  authors: ["author"],
  questions: [singleQuestion, multipleQuestion],
};
