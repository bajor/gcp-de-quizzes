import type { DraftQuestionSet } from "../../domain/questions";
import { practiceV1Sections } from "./sections";

export const practiceV1Draft: DraftQuestionSet = {
  id: "professional-data-engineer-v4.2-practice-1",
  version: 1,
  title: "Professional Data Engineer Practice Exam 1",
  guideVersion: "4.2",
  durationMinutes: 120,
  sections: practiceV1Sections,
};

export const draftQuestionSets: readonly DraftQuestionSet[] = [practiceV1Draft];
