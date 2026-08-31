import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createAttempt } from "../domain/attempt";
import { fixtureQuestionSet } from "../test/fixtures";
import { ExamScreen } from "./ExamScreen";

afterEach(() => vi.useRealTimers());

it("expires an attempt when its deadline is reached", () => {
  vi.useFakeTimers();
  vi.setSystemTime(1_000);
  const expire = vi.fn();
  const attempt = { ...createAttempt(fixtureQuestionSet, 0), deadline: 1_000 };
  render(
    <ExamScreen
      questionSet={fixtureQuestionSet}
      attempt={attempt}
      onAnswer={() => undefined}
      onNavigate={() => undefined}
      onToggleMark={() => undefined}
      onFinish={() => undefined}
      onExpire={expire}
    />,
  );
  act(() => vi.advanceTimersByTime(0));
  expect(expire).toHaveBeenCalledOnce();
});
