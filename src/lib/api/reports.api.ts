import { api } from "./client";

export type ReportMetric = {
  label?: string;
  value?: number;
  total?: number;
  count?: number;
  growth?: number;
  change?: number;
};

export type AdminOverviewReport = {
  totalUsers?: number;
  totalLearners?: number;
  totalTeachers?: number;
  totalTests?: number;
  totalAttempts?: number;
  completedAttempts?: number;
  gradedAttempts?: number;
  averageBand?: number;
  passRate?: number;
  completionRate?: number;
  monthlyRevenue?: number;
  revenue?: number;
  usersGrowth?: number;
  attemptsGrowth?: number;
  testsGrowth?: number;
  metrics?: Record<string, unknown>;
};

export type AdminAttemptReportItem = {
  label?: string;
  month?: string;
  date?: string;
  skill?: string;
  testType?: string;
  status?: string;
  count?: number;
  total?: number;
  attempts?: number;
  completed?: number;
  submitted?: number;
};

export type AdminTestReportItem = {
  id?: string;
  title?: string;
  type?: string;
  status?: string;
  attempts?: number;
  completedAttempts?: number;
  averageBand?: number;
  sections?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUserReportItem = {
  label?: string;
  month?: string;
  date?: string;
  role?: string;
  status?: string;
  count?: number;
  total?: number;
  users?: number;
  learners?: number;
  teachers?: number;
};
export type TeacherGradingReportItem = {
  teacherId?: string;
  teacherName?: string;
  fullName?: string;
  email?: string;
  reviewed?: number;
  pending?: number;
  claimed?: number;
  averageScore?: number;
  averageBand?: number;
  status?: string;
  updatedAt?: string;
};

export type BandDistributionItem = {
  band?: number;
  score?: number;
  label?: string;
  count?: number;
  total?: number;
};

export const getLearnerOverview = () => api.get("/reports/me/overview");
export const getLearnerSkills = () => api.get("/reports/me/skills");
export const getLearnerTimeline = () => api.get("/reports/me/timeline");

export const getTeacherOverview = () => api.get("/reports/teacher/overview");
export const getTeacherPerformance = () =>
  api.get("/reports/teacher/performance");

export const getAdminOverview = () =>
  api.get<AdminOverviewReport>("/admin/reports/overview");

export const getAdminAttempts = () =>
  api.get<AdminAttemptReportItem[]>("/admin/reports/attempts");

export const getAdminTests = () =>
  api.get<AdminTestReportItem[]>("/admin/reports/tests");

export const getAdminUsers = () =>
  api.get<AdminUserReportItem[]>("/admin/reports/users");

export const getTeacherGrading = () =>
  api.get<TeacherGradingReportItem[]>("/admin/reports/teacher-grading");

export const getBandsDistribution = () =>
  api.get<BandDistributionItem[]>("/admin/reports/bands-distribution");
