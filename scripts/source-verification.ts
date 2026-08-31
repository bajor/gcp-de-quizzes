import { isGoogleOwnedSourceUrl, type DraftQuestionSet, type QuestionSet } from "../src/domain/questions";

interface SourceResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly url: string;
}

export type SourceFetcher = (url: string) => Promise<SourceResponse>;

export function collectEvidenceUrls(
  drafts: readonly DraftQuestionSet[],
  candidates: readonly QuestionSet[],
): string[] {
  return [...new Set([
    ...drafts.flatMap((draft) =>
      draft.sections.flatMap((section) =>
        section.questions.flatMap((question) => question.evidence.map((source) => source.url)),
      ),
    ),
    ...candidates.flatMap((questionSet) =>
      questionSet.questions.flatMap((question) => question.evidence.map((source) => source.url)),
    ),
  ])];
}

export async function findSourceFailures(urls: readonly string[], fetchSource: SourceFetcher): Promise<string[]> {
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetchSource(url);
        if (!response.ok) return `${url}: HTTP ${response.status}`;
        return isGoogleOwnedSourceUrl(response.url) ? null : `${url}: redirected to non-Google source ${response.url}`;
      } catch (error) {
        return `${url}: ${error instanceof Error ? error.message : "request failed"}`;
      }
    }),
  );
  return results.filter((result): result is string => result !== null);
}
