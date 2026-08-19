export interface Character {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface Option {
  id: string;
  label: string;
  weight: number; // 0..1
  feedbackId: string | null;
}

export interface Feedback {
  id: string;
  verdict: "correct" | "partial" | "wrong";
  markdown: string;
  crossSellModuleId?: string;
}

export interface MessageBlock {
  type: "message";
  character: string;
  markdown: string;
}

export interface ArtifactBlock {
  type: "artifact";
  kind: "okr" | "code" | "image";
  content?: string;
  imageUrl?: string;
  lang?: string;
}

export interface SupersetToolConfig {
  database: string;
  schema: string;
  table: string;
  defaultQuery: string;
}

export interface MixpanelInsightsConfig {
  metric: string;
  grouping: "week" | "month";
  weekly: { label: string; value: number }[];
  weeklyAverage: number;
  monthlyUnique: number;
}

export interface MixpanelFunnelConfig {
  steps: { name: string; count: number; stepConversionFromPrev: number | null }[];
  overallConversion: number;
}

export interface ToolBlock {
  type: "tool";
  kind: "superset" | "mixpanel-insights" | "mixpanel-funnel" | "api" | "sheet";
  collapsedLabel: string;
  config: SupersetToolConfig | MixpanelInsightsConfig | MixpanelFunnelConfig | Record<string, unknown>;
}

export interface QuestionBlock {
  type: "question";
  id: string;
  prompt?: string;
  sendLabel: string;
  options: Option[];
}

export interface FeedbackBlockNode {
  type: "feedback";
  id: string;
  verdict: "correct" | "partial" | "wrong";
  markdown: string;
  crossSellModuleId?: string;
}

export interface ContinueBlock {
  type: "continue";
  label: string;
}

export type Block =
  | MessageBlock
  | ArtifactBlock
  | ToolBlock
  | QuestionBlock
  | FeedbackBlockNode
  | ContinueBlock;

export interface Lesson {
  id: string;
  moduleId?: string;
  title: string;
  blocks: Block[];
}

export interface LessonContent {
  module: {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    isFree?: boolean;
  };
  characters: Character[];
  lesson: Lesson;
}

export interface Answer {
  questionBlockId: string;
  optionId: string;
  weight: number;
  ts: number;
}

export interface UserLessonProgress {
  lessonId: string;
  revealedCount: number; // how many blocks are revealed
  answers: Answer[];
  completedAt: number | null;
}
