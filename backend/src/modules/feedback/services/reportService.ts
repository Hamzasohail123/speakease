import { Feedback, Mistake } from '@ai-english-speaker/shared';

/**
 * Generate a formatted report from feedback
 */
export function generateReport(feedback: Feedback): string {
  let report = 'Session English Report\n\n';

  // Mistakes section
  if (feedback.mistakes && feedback.mistakes.length > 0) {
    report += '1. Repeated Mistakes\n\n';
    feedback.mistakes.forEach((mistake, index) => {
      report += `${index + 1}. ${mistake.category}\n`;
      report += `   ${mistake.explanation}\n`;
      if (mistake.incorrect) {
        report += `   ❌ "${mistake.incorrect}"\n`;
      }
      if (mistake.correct) {
        report += `   ✅ "${mistake.correct}"\n`;
      }
      if (mistake.frequency > 1) {
        report += `   (Appeared ${mistake.frequency} times)\n`;
      }
      report += '\n';
    });
  }

  // Improvements section
  if (feedback.improvements && feedback.improvements.length > 0) {
    report += '2. Good Improvements\n\n';
    feedback.improvements.forEach((improvement) => {
      report += `- ${improvement}\n`;
    });
    report += '\n';
  }

  // Tips section
  if (feedback.tips && feedback.tips.length > 0) {
    report += '3. Tips for Next Session\n\n';
    feedback.tips.forEach((tip) => {
      report += `- ${tip}\n`;
    });
    report += '\n';
  }

  // Use reportText if available
  if (feedback.reportJson && (feedback.reportJson as any).reportText) {
    report = (feedback.reportJson as any).reportText;
  }

  return report;
}

/**
 * Format mistakes by category
 */
export function groupMistakesByCategory(mistakes: Mistake[]): Record<string, Mistake[]> {
  const grouped: Record<string, Mistake[]> = {};

  mistakes.forEach((mistake) => {
    if (!grouped[mistake.category]) {
      grouped[mistake.category] = [];
    }
    grouped[mistake.category].push(mistake);
  });

  return grouped;
}

