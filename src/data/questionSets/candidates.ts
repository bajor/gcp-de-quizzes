import { assembleCandidateQuestionSets } from "../../domain/questions";
import { draftQuestionSets } from "./drafts";

const candidateQuestionSetIds: readonly string[] = [];
export const candidateQuestionSets = assembleCandidateQuestionSets(
  draftQuestionSets,
  candidateQuestionSetIds,
);
