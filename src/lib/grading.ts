import type { Answer, Option } from "./types";

export function gradeOption(option: Option): "correct" | "partial" | "wrong" {
  if (option.weight >= 1) return "correct";
  if (option.weight > 0) return "partial";
  return "wrong";
}

export function computeScore(answers: Answer[]): { score: number; maxScore: number; percent: number } {
  const score = answers.reduce((sum, a) => sum + a.weight, 0);
  const maxScore = answers.length; // each question's max weight is 1
  const percent = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
  return { score, maxScore, percent };
}
