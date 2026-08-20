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
  database?: string;
  schema?: string;
  table?: string;
  defaultQuery: string;
}

// Legacy shape (base tryout lesson): a week/month toggle over two fixed series.
export interface MixpanelInsightsToggleConfig {
  metric: string;
  grouping: "week" | "month";
  weekly: { label: string; value: number }[];
  weeklyAverage: number;
  monthlyUnique: number;
}

// General shape: a single labeled series, no toggle.
export interface MixpanelInsightsSeriesConfig {
  metric: string;
  grouping: string;
  series: { label: string; value: number }[];
  average?: number;
}

export type MixpanelInsightsConfig = MixpanelInsightsToggleConfig | MixpanelInsightsSeriesConfig;

export interface MixpanelFunnelConfig {
  steps: { name: string; count: number; stepConversionFromPrev: number | null }[];
  overallConversion: number;
}

export interface MixpanelRetentionConfig {
  unit: string;
  cohorts: { label: string; size: number; retention: number[] }[];
}

export interface AbResultConfig {
  primaryMetric: string;
  guardrailMetric?: string;
  variants: { name: string; users: number; metric: string }[];
  relativeUplift: string;
  pValue?: number;
  confidenceInterval?: string;
  powered?: boolean;
}

export interface EconGridCell {
  label: string;
  value?: number;
  unit?: string;
  given?: boolean;
  computed?: boolean;
  formula?: string;
  note?: string;
}

export interface EconGridConfig {
  cells: EconGridCell[];
}

export type ToolConfig =
  | SupersetToolConfig
  | MixpanelInsightsConfig
  | MixpanelFunnelConfig
  | MixpanelRetentionConfig
  | AbResultConfig
  | EconGridConfig
  | Record<string, unknown>;

export interface ToolBlock {
  type: "tool";
  kind:
    | "superset"
    | "sql"
    | "mixpanel-insights"
    | "mixpanel-funnel"
    | "mixpanel-retention"
    | "ab-result"
    | "econ-grid"
    | "api"
    | "sheet";
  collapsedLabel?: string;
  config: ToolConfig;
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

export interface ToolDefaults {
  kind?: string;
  database?: string;
  schema?: string;
  collapsedLabel?: string;
}

export interface Lesson {
  id: string;
  moduleId?: string;
  title: string;
  toolDefaults?: ToolDefaults;
  dataset?: string;
  note?: string;
  blocks: Block[];
}

export interface LessonContent {
  module: {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    priceEUR?: number;
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
