import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { InProgressAttempt } from "../domain/attempt";
import type { ChoiceId, QuestionSet } from "../domain/questions";
import { ConfirmDialog } from "./ConfirmDialog";

interface ExamScreenProps {
  readonly questionSet: QuestionSet;
  readonly attempt: InProgressAttempt;
  readonly onAnswer: (choiceId: ChoiceId) => void;
  readonly onNavigate: (index: number) => void;
  readonly onToggleMark: () => void;
  readonly onFinish: () => void;
  readonly onExpire: () => void;
}

export function ExamScreen({
  questionSet,
  attempt,
  onAnswer,
  onNavigate,
  onToggleMark,
  onFinish,
  onExpire,
}: ExamScreenProps) {
  const [now, setNow] = useState(attempt.startedAt);
  const [confirming, setConfirming] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const expire = useEffectEvent(onExpire);
  const question = questionSet.questions[attempt.currentQuestionIndex];
  const selected = attempt.answers[question.id] ?? [];
  const marked = attempt.markedQuestionIds.includes(question.id);
  const unanswered = questionSet.questions.filter((item) => !(attempt.answers[item.id]?.length)).length;

  useEffect(() => {
    const immediate = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => {
      window.clearTimeout(immediate);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (now >= attempt.deadline) expire();
  }, [attempt.deadline, now]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [question.id]);

  return (
    <main className="exam-shell">
      <header className="exam-header">
        <div>
          <p className="eyebrow">{questionSet.title}</p>
          <p className="progress-copy">Question {attempt.currentQuestionIndex + 1} of {questionSet.questions.length}</p>
        </div>
        <div className="timer" aria-label={`Time remaining ${formatTime(attempt.deadline - now)}`}>
          <span>Time remaining</span>
          <strong>{formatTime(attempt.deadline - now)}</strong>
        </div>
      </header>

      <div className="exam-layout">
        <section className="question-card" aria-labelledby="question-heading">
          <div className="question-meta">
            <span>{question.kind === "single" ? "Select one" : `Choose ${question.requiredSelections}`}</span>
          </div>
          <h1 ref={headingRef} id="question-heading" tabIndex={-1}>{question.prompt}</h1>
          <button className="mark-button" aria-pressed={marked} onClick={onToggleMark}>
            {marked ? "Marked for review" : "Mark for review"}
          </button>
          <fieldset>
            <legend className="sr-only">Answer choices</legend>
            {question.choices.map((choice) => {
              const checked = selected.includes(choice.id);
              const disabled = question.kind === "multiple" && !checked && selected.length >= question.requiredSelections;
              return (
                <label className="choice" key={choice.id} data-selected={checked} data-disabled={disabled}>
                  <input
                    type={question.kind === "single" ? "radio" : "checkbox"}
                    name={question.id}
                    value={choice.id}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onAnswer(choice.id)}
                  />
                  <span className="choice-letter">{choice.id.toUpperCase()}</span>
                  <span>{choice.text}</span>
                </label>
              );
            })}
          </fieldset>
          <nav className="question-actions" aria-label="Question navigation controls">
            <button disabled={attempt.currentQuestionIndex === 0} onClick={() => onNavigate(attempt.currentQuestionIndex - 1)}>
              Previous
            </button>
            <button
              disabled={attempt.currentQuestionIndex === questionSet.questions.length - 1}
              onClick={() => onNavigate(attempt.currentQuestionIndex + 1)}
            >
              Next
            </button>
          </nav>
        </section>

        <aside className="navigator" aria-label="Question navigator">
          <p><strong>{questionSet.questions.length - unanswered}</strong> answered</p>
          <div className="question-grid">
            {questionSet.questions.map((item, index) => {
              const isAnswered = Boolean(attempt.answers[item.id]?.length);
              const isMarked = attempt.markedQuestionIds.includes(item.id);
              const label = `Question ${index + 1}${isAnswered ? ", answered" : ", unanswered"}${isMarked ? ", marked" : ""}`;
              return (
                <button
                  key={item.id}
                  className="question-number"
                  data-current={index === attempt.currentQuestionIndex}
                  data-answered={isAnswered}
                  data-marked={isMarked}
                  aria-current={index === attempt.currentQuestionIndex ? "step" : undefined}
                  aria-label={label}
                  onClick={() => onNavigate(index)}
                >
                  {index + 1}{isMarked && <span aria-hidden="true">*</span>}
                </button>
              );
            })}
          </div>
          <button className="finish-button" onClick={() => setConfirming(true)}>Finish exam</button>
        </aside>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Finish this attempt?"
          cancelLabel="Keep working"
          confirmLabel="Submit answers"
          onCancel={() => setConfirming(false)}
          onConfirm={onFinish}
        >
          <p>{unanswered} unanswered and {attempt.markedQuestionIds.length} marked for review.</p>
        </ConfirmDialog>
      )}
    </main>
  );
}

function formatTime(milliseconds: number): string {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1_000));
  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}
