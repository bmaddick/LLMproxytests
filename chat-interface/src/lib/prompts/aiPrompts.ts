import { PROBLEM_TAGS, type ProblemTag } from '../../config/problemTags';
import { BEST_PRACTICES_SUMMARY } from '../../config/bestPracticesSummary';

/**
 * Builds a prompt for the AI to analyze a support case
 * @param caseText The user's case description
 * @returns Formatted prompt string
 */
export function buildCasePrompt(caseText: string): string {
  return `You are a support engineer analyzing a case submission. Please provide a structured analysis following these steps:

1. Problem Type Identification
   Available tags: ${PROBLEM_TAGS.join(', ')}
   Based on the case description, identify which tags apply (can be multiple or none).
   Explain your reasoning for each selected tag.

2. Best Practices Analysis
   Compare the case description to these best practices:
   ${BEST_PRACTICES_SUMMARY}

   List any missing or incomplete information, specifically:
   - Required details that are absent
   - Areas where more clarity would help
   - Additional evidence needed (screenshots, error messages, etc.)

3. Self-Service Assessment
   Determine if the support representative can resolve this independently:
   - Consider standard troubleshooting steps
   - Reference any relevant documentation
   - Explain your reasoning

Case Description:
"""
${caseText}
"""

Please format your response in clear sections:
1. PROBLEM TAGS: [List selected tags with brief justification]
2. MISSING INFORMATION: [List required details that should be added]
3. SELF-SERVICE: [Yes/No with explanation]`;
}

/**
 * Type definition for the AI's structured response
 */
export interface CaseAnalysis {
  problemTags: ProblemTag[];
  missingInformation: string[];
  canSelfService: boolean;
  reasoning: string;
}
