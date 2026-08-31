import { useEffect, useState } from "react";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ExamScreen } from "./components/ExamScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { StartScreen } from "./components/StartScreen";
import {
  answerQuestion,
  clearAttempt,
  completeAttempt,
  createAttempt,
  loadAttempt,
  saveAttempt,
  scoreAttempt,
  type Attempt,
  type InProgressAttempt,
} from "./domain/attempt";
import type { ChoiceId, QuestionSet } from "./domain/questions";
import { activeQuestionSet } from "./data/questionSets";

interface AppProps {
  readonly questionSet?: QuestionSet;
}

export function App({ questionSet = activeQuestionSet }: AppProps) {
  const [attempt, setAttempt] = useState<Attempt | null>(() =>
    questionSet ? restore(questionSet) : null,
  );
  const [confirmingRestart, setConfirmingRestart] = useState(false);

  useEffect(() => {
    if (attempt) saveAttempt(attempt);
  }, [attempt]);

  if (!questionSet) return <StartScreen onStart={() => undefined} />;
  if (!attempt) return <StartScreen questionSet={questionSet} onStart={() => setAttempt(createAttempt(questionSet))} />;

  if (attempt.status === "completed") {
    return (
      <>
        <ResultsScreen
          questionSet={questionSet}
          attempt={attempt}
          score={scoreAttempt(questionSet, attempt.answers)}
          onRestart={() => setConfirmingRestart(true)}
        />
        {confirmingRestart && (
          <ConfirmDialog
            title="Replace this result?"
            cancelLabel="Keep result"
            confirmLabel="Start new attempt"
            onCancel={() => setConfirmingRestart(false)}
            onConfirm={() => {
              clearAttempt();
              setConfirmingRestart(false);
              setAttempt(createAttempt(questionSet));
            }}
          >
            <p>Your completed attempt will be removed from this browser.</p>
          </ConfirmDialog>
        )}
      </>
    );
  }

  const update = (change: (current: InProgressAttempt) => InProgressAttempt) => {
    setAttempt((current) => current?.status === "in-progress" ? change(current) : current);
  };
  const question = questionSet.questions[attempt.currentQuestionIndex];

  return (
    <ExamScreen
      questionSet={questionSet}
      attempt={attempt}
      onAnswer={(choiceId: ChoiceId) => update((current) => answerQuestion(current, question, choiceId))}
      onNavigate={(currentQuestionIndex) => update((current) => ({ ...current, currentQuestionIndex }))}
      onToggleMark={() => update((current) => {
        const marked = current.markedQuestionIds.includes(question.id);
        return {
          ...current,
          markedQuestionIds: marked
            ? current.markedQuestionIds.filter((id) => id !== question.id)
            : [...current.markedQuestionIds, question.id],
        };
      })}
      onFinish={() => setAttempt((current) => current?.status === "in-progress" ? completeAttempt(current) : current)}
      onExpire={() => setAttempt((current) => current?.status === "in-progress" ? completeAttempt(current) : current)}
    />
  );
}

function restore(questionSet: QuestionSet): Attempt | null {
  const restored = loadAttempt(questionSet);
  return restored?.status === "in-progress" && restored.deadline <= Date.now()
    ? completeAttempt(restored, restored.deadline)
    : restored;
}
