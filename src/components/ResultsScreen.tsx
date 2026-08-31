import { useEffect, useRef } from "react";
import type { CompletedAttempt, Score } from "../domain/attempt";
import { examSections, type QuestionSet } from "../domain/questions";

interface ResultsScreenProps {
  readonly questionSet: QuestionSet;
  readonly attempt: CompletedAttempt;
  readonly score: Score;
  readonly onRestart: () => void;
}

export function ResultsScreen({ questionSet, attempt, score, onRestart }: ResultsScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main className="results-shell">
      <header className="results-hero">
        <p className="eyebrow">Practice result</p>
        <h1 ref={headingRef} tabIndex={-1}>{score.percentage.toFixed(1)}%</h1>
        <p>{score.correct} of {score.total} questions correct</p>
        <p className="disclaimer">Practice percentage only. Google does not publish a passing score.</p>
        <button className="primary-button" onClick={onRestart}>Start a new attempt</button>
      </header>

      <section className="section-results" aria-labelledby="section-heading">
        <h2 id="section-heading">Section breakdown</h2>
        <div className="section-grid">
          {(Object.keys(examSections) as Array<keyof typeof examSections>).map((section) => (
            <article key={section}>
              <strong>{score.sections[section].percentage.toFixed(1)}%</strong>
              <span>{examSections[section]}</span>
              <small>{score.sections[section].correct}/{score.sections[section].total}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="review-list" aria-labelledby="review-heading">
        <h2 id="review-heading">Answer review</h2>
        {questionSet.questions.map((question, index) => {
          const selected = attempt.answers[question.id] ?? [];
          const correct = score.correctQuestionIds.has(question.id);
          return (
            <article className="review-card" key={question.id}>
              <p className={correct ? "result-correct" : "result-wrong"}>
                Question {index + 1}: {correct ? "Correct" : "Incorrect"}
              </p>
              <h3>{question.prompt}</h3>
              <div className="review-choices">
                {question.choices.map((choice) => {
                  const isCorrect = question.kind === "single"
                    ? question.correctChoiceId === choice.id
                    : question.correctChoiceIds.includes(choice.id);
                  const isSelected = selected.includes(choice.id);
                  const status = [isSelected && "Your answer", isCorrect && "Correct answer"].filter(Boolean).join(" / ");
                  return (
                    <div key={choice.id} data-correct={isCorrect} data-selected={isSelected}>
                      {status && <p className="choice-status">{status}</p>}
                      <p><strong>{choice.id.toUpperCase()}.</strong> {choice.text}</p>
                      <p>{choice.feedback}</p>
                    </div>
                  );
                })}
              </div>
              <details>
                <summary>Google Cloud sources, verified {question.verifiedOn}</summary>
                <ul>
                  {question.evidence.map((source) => (
                    <li key={source.id}>
                      <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>: {source.claim}
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          );
        })}
      </section>
    </main>
  );
}
