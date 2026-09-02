import type { AnyQuestionSection } from "../../../domain/questions";
import { designSection } from "./design";
import { ingestSection } from "./ingest";

export const practiceV1Sections: readonly AnyQuestionSection[] = [designSection, ingestSection];
