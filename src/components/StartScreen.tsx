import type { QuestionSet } from "../domain/questions";

interface StartScreenProps {
  readonly questionSet?: QuestionSet;
  readonly onStart: () => void;
}

export function StartScreen({ questionSet, onStart }: StartScreenProps) {
  return (
    <main className="start-shell">
      <section className="hero-card" aria-labelledby="page-title">
        <p className="eyebrow">Professional Data Engineer</p>
        <h1 id="page-title">Documentation-backed practice exam</h1>
        <p className="lede">
          Original scenarios mapped to exam guide v4.2, with every answer checked against current
          Google Cloud documentation.
        </p>
        {questionSet ? (
          <>
            <dl className="exam-facts">
              <div><dt>Questions</dt><dd>{questionSet.questions.length}</dd></div>
              <div><dt>Time</dt><dd>{questionSet.durationMinutes / 60} hours</dd></div>
              <div><dt>Scoring</dt><dd>Exact match</dd></div>
            </dl>
            <button className="primary-button" onClick={onStart}>Start practice exam</button>
          </>
        ) : (
          <div className="notice" role="status">
            The first question set is undergoing independent documentation review.
          </div>
        )}
        <p className="disclaimer">
          Independent practice project. Not affiliated with or endorsed by Google. Google does not
          publish a passing score, so results are shown only as practice percentages.
        </p>
      </section>
    </main>
  );
}
