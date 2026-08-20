import tryoutLesson from "../../content/tryout-lesson.json";
import sqlForPms from "../../content/sql-for-pms.json";
import analyticsForPms from "../../content/analytics-for-pms.json";
import abTestingForPms from "../../content/ab-testing-for-pms.json";
import unitEconomicsForPms from "../../content/unit-economics-for-pms.json";
import type { LessonContent } from "./types";

export const MODULES: Record<string, LessonContent> = {
  [tryoutLesson.module.id]: tryoutLesson as LessonContent,
  [sqlForPms.module.id]: sqlForPms as LessonContent,
  [analyticsForPms.module.id]: analyticsForPms as LessonContent,
  [abTestingForPms.module.id]: abTestingForPms as LessonContent,
  [unitEconomicsForPms.module.id]: unitEconomicsForPms as LessonContent,
};

export const MODULE_LIST = Object.values(MODULES);
