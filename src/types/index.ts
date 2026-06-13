export type BackendRole = "USER" | "TEACHER" | "ADMIN";
export type AppRole = "LEARNER" | "TEACHER" | "ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED" | "PENDING";
export type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AttemptStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "GRADING"
  | "GRADED"
  | "ERROR"
  | "EXPIRED";
export type TestType =
  | "READING"
  | "LISTENING"
  | "WRITING"
  | "SPEAKING"
  | "FULL";
export type TestSectionType =
  | "READING_SET"
  | "LISTENING_SET"
  | "WRITING_TASK"
  | "SPEAKING_SET";
export type SpeakingPart = "PART_1" | "PART_2" | "PART_3";
export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE_NOT_GIVEN"
  | "YES_NO_NOT_GIVEN"
  | "MATCHING_HEADINGS"
  | "MATCHING_INFORMATION"
  | "MATCHING_FEATURES"
  | "MATCHING_SENTENCE_ENDINGS"
  | "SENTENCE_COMPLETION"
  | "SUMMARY_COMPLETION"
  | "NOTE_COMPLETION"
  | "TABLE_COMPLETION"
  | "FLOWCHART_COMPLETION"
  | "DIAGRAM_LABEL_COMPLETION"
  | "SHORT_ANSWER"
  | "FORM_COMPLETION"
  | "MAP_LABELING";

export type ApiMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};
export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: ApiMeta;
};
export type Paginated<T> = { items: T[]; meta: ApiMeta };
export type QueryParams = Record<
  string,
  string | number | boolean | string[] | undefined | null
>;
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type User = {
  id: string;
  fullName?: string;
  full_name?: string;
  email: string;
  role: BackendRole;
  status?: UserStatus;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  createdAt?: string;
  created_at?: string;
  lastLoginAt?: string | null;
};
export type UserSummary = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};
export type AuthResponse = { accessToken: string; user: User };

export type Tag = {
  id: string;
  name: string;
  slug?: string;
  createdAt?: string;
};

export type BaseContent = {
  id: string;
  title?: string;
  level?: number | null;
  status?: PublishStatus;
  tags?: Tag[];
  createdAt?: string;
  updatedAt?: string;
};
export type ReadingSet = BaseContent & {
  title: string;
  passageHtml?: string | null;
  passageText?: string | null;
  questions?: Question[];
};
export type ListeningSet = BaseContent & {
  title: string;
  transcriptText?: string | null;
  audioUrl?: string | null;
  audioSource?: "UPLOAD" | "URL" | "R2" | null;
  questions?: Question[];
};
export type WritingTask = BaseContent & {
  title: string;
  taskNo?: 1 | 2;
  promptText?: string;
  chartUrl?: string | null;
  imageUrl?: string | null;
};
export type SpeakingSet = BaseContent & {
  topic?: string;
  parts?: SpeakingPartModel[];
};
export type SpeakingPartModel = {
  id: string;
  partType: SpeakingPart;
  title?: string | null;
  description?: string | null;
  sortOrder?: number;
  prompts?: SpeakingPrompt[];
};
export type SpeakingPromptItem = {
  id: string;
  promptId?: string;
  itemText: string;
  sortOrder?: number | null;
};

export type SpeakingPrompt = {
  id: string;
  partId?: string;
  promptType: string;
  content: string;
  preparationSec?: number | null;
  speakingSec?: number | null;
  sortOrder?: number | null;
  items?: SpeakingPromptItem[];
};

export type Question = {
  id: string;
  qNo?: number;
  sortOrder?: number;
  questionType?: QuestionType;
  promptText?: string;
  instructionText?: string | null;
  optionsJson?: JsonValue;
  correctAnswerJson?: JsonValue;
  explanation?: string | null;
  points?: number;
};

export type TestSection = {
  id?: string;
  sectionType: TestSectionType;
  readingSetId?: string | null;
  listeningSetId?: string | null;
  writingTaskId?: string | null;
  speakingSetId?: string | null;
  partLabel?: string | null;
  sortOrder: number;
  timeLimitSec?: number | null;
};
export type Test = {
  id: string;
  type: TestType;
  title: string;
  level?: number | null;
  description?: string | null;
  status?: PublishStatus;
  sections?: TestSection[];
  tags?: Tag[];
  publishedAt?: string | null;
};
export type Attempt = {
  id: string;
  testId?: string;
  mode?: TestType;
  status?: AttemptStatus;
  startedAt?: string;
  submittedAt?: string | null;
  expiresAt?: string | null;
  test?: Test;
  overallBand?: number | null;
  partLabel?: string | null;
  part_label?: string | null;
  timeLimitSec?: number | null;
  time_limit_sec?: number | null;
  started_at?: string;
  submitted_at?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  bandScore?: number | null;
  score?: number | null;
};
export type Notification = {
  id: string;
  title?: string;
  message?: string;
  body?: string;
  isRead?: boolean;
  readAt?: string | null;
  createdAt?: string;
  type?: string;
};
export type Blog = {
  id: string;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  contentMarkdown?: string | null;
  coverImageUrl?: string | null;
  status?: PublishStatus;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  tags?: Tag[];
  author?: {
    id: string;
    fullName?: string | null;
    email?: string | null;
  } | null;
};
export type TeacherSubmissionStatus = "PENDING" | "CLAIMED" | "REVIEWED";

export type TeacherReviewSummary = {
  id: string;
  overallBand?: number | null;
  criteriaJson?: JsonValue | null;
  summary?: string | null;
  actionItemsJson?: JsonValue | null;
  reviewedBy?: UserSummary | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type TeacherSubmission = {
  id: string;
  attemptId?: string;
  skill?: "WRITING" | "SPEAKING";
  status?: TeacherSubmissionStatus;
  learner?: UserSummary | null;
  student?: UserSummary | null;
  test?: Test | null;
  claimedBy?: string | null;
  claimedAt?: string | null;
  claimedTeacher?: UserSummary | null;
  review?: TeacherReviewSummary | null;
  reviewedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};
export type ReportPoint = {
  label: string;
  value: number;
  reading?: number;
  listening?: number;
  writing?: number;
  speaking?: number;
};

export const toAppRole = (role?: string | null): AppRole | undefined => {
  if (role === "USER" || role === "LEARNER" || role === "STUDENT")
    return "LEARNER";
  if (role === "TEACHER") return "TEACHER";
  if (role === "ADMIN") return "ADMIN";
  return undefined;
};
export const displayName = (user?: Partial<User> | null) =>
  user?.fullName || user?.full_name || user?.email || "Unknown user";
