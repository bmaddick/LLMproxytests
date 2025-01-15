/**
 * Predefined list of problem tags for case analysis
 * These tags are used by the AI to categorize support cases
 */
export const PROBLEM_TAGS = [
  "feed issue",
  "payment issue",
  "visibility issue",
  "candidate issue",
  "volume issue",
  "product issue"
] as const;

/**
 * Type definition for problem tags to ensure type safety
 */
export type ProblemTag = typeof PROBLEM_TAGS[number];
