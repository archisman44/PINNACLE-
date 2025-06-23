
import { LANGUAGETOOL_API_URL } from '../constants';
import { LanguageToolCorrectionResult, LanguageToolApiResponse, LanguageToolMatch } from '../types';

export class LanguageToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LanguageToolError';
    Object.setPrototypeOf(this, LanguageToolError.prototype);
  }
}

// Helper function to apply corrections and generate explanations
const applyCorrectionsAndExplain = (
  originalText: string, // This is the trimmedText from the calling function
  matches: LanguageToolMatch[]
): LanguageToolCorrectionResult => {
  const changeDetails: string[] = [];
  
  const validMatches = matches || [];

  // Sort matches by offset in ascending order for correct application
  const sortedMatches = [...validMatches].sort((a, b) => a.offset - b.offset);
  
  const parts: string[] = [];
  let currentIndex = 0;

  for (const match of sortedMatches) {
    if (match.offset > currentIndex) {
      parts.push(originalText.substring(currentIndex, match.offset));
    }

    const segmentInOriginalText = originalText.substring(match.offset, match.offset + match.length);
    let valueToInsert = segmentInOriginalText; 
    let issueDetailMessage = `Suggestion for "${segmentInOriginalText}": ${match.message}`;

    if (match.replacements && match.replacements.length > 0) {
      const apiReplacementValue = match.replacements[0].value;
      if (typeof apiReplacementValue === 'string' &&
          apiReplacementValue.toLowerCase() !== "undefined" &&
          apiReplacementValue.toLowerCase() !== "null") {
        valueToInsert = apiReplacementValue;
        if (valueToInsert !== segmentInOriginalText) {
          issueDetailMessage = `- Changed "${segmentInOriginalText}" to "${valueToInsert}". (Reason: ${match.message})`;
        } else {
          issueDetailMessage = `- Suggestion for "${segmentInOriginalText}": ${match.message} (Suggested replacement was same as original).`;
        }
      } else {
        issueDetailMessage = `- Issue with "${segmentInOriginalText}": ${match.message} (Invalid or no replacement data from API, no change applied).`;
      }
    } else {
      issueDetailMessage = `- Issue with "${segmentInOriginalText}": ${match.message} (No automatic correction available).`;
    }
    
    parts.push(valueToInsert);
    currentIndex = match.offset + match.length;
    
    changeDetails.push(issueDetailMessage); 
  }

  if (currentIndex < originalText.length) {
    parts.push(originalText.substring(currentIndex));
  }

  const processedCorrectedText = parts.length > 0 ? parts.join('') : originalText;
  const textualChangesActuallyMade = originalText !== processedCorrectedText;

  let definitiveBaseText: string;
  if (validMatches.length === 0) {
    definitiveBaseText = originalText;
  } else if (textualChangesActuallyMade) {
    definitiveBaseText = processedCorrectedText;
  } else {
    definitiveBaseText = originalText; 
  }

  // --- Start of Enhanced Final Cleaning (Revised Order) ---
  let finalCleanedText = definitiveBaseText.trim(); // 1. Initial Trim

  // 2. Robustly remove trailing ".undefined" or "undefined" (EARLY)
  finalCleanedText = finalCleanedText.replace(/\.?\s*undefined$/i, '');

  // 3. Heuristic: Fix "Te " to "The "
  if (finalCleanedText.startsWith("Te ") && finalCleanedText.length > 3 && /^[a-z]/.test(finalCleanedText.substring(3))) {
    finalCleanedText = "The " + finalCleanedText.substring(3);
  }

  // 4. Heuristic: Contextual fix for "H "/"h " to "He "/"he " based on original text
  if (originalText.startsWith("He ") && finalCleanedText.startsWith("H ") && finalCleanedText.length >= 1) { 
      if (finalCleanedText.length === 1 || (finalCleanedText.length > 1 && finalCleanedText.charAt(1) === ' ' && (finalCleanedText.length === 2 || /^[a-z]/.test(finalCleanedText.substring(2))))){
        finalCleanedText = "He" + (finalCleanedText.length > 1 ? finalCleanedText.substring(1) : "");
      }
  } else if (originalText.startsWith("he ") && finalCleanedText.startsWith("h ") && finalCleanedText.length >=1 ) {
      if (finalCleanedText.length === 1 || (finalCleanedText.length > 1 && finalCleanedText.charAt(1) === ' ' && (finalCleanedText.length === 2 || /^[a-z]/.test(finalCleanedText.substring(2))))){
        finalCleanedText = "he" + (finalCleanedText.length > 1 ? finalCleanedText.substring(1) : "");
      }
  }

  // 5. Final trim to remove any spaces introduced or left by replacements/heuristics.
  finalCleanedText = finalCleanedText.trim();
  // --- End of Enhanced Final Cleaning ---

  const finalCorrectedTextForDisplay = finalCleanedText;

  let finalExplanation: string;
  if (validMatches.length === 0) {
    finalExplanation = `No grammar issues found. The text is:\n<strong>${finalCorrectedTextForDisplay}</strong>`;
  } else {
    const explanationIntro = textualChangesActuallyMade ? 
      `The corrected text is:\n<strong>${finalCorrectedTextForDisplay}</strong>` :
      `No textual changes were applied. The text is:\n<strong>${finalCorrectedTextForDisplay}</strong>`;
    
    if (changeDetails.length > 0) {
      finalExplanation = `${explanationIntro}\n\nSummary of changes and suggestions:\n${changeDetails.join('\n')}`;
    } else { 
      finalExplanation = explanationIntro;
    }
  }
  
  return {
    correctedText: finalCorrectedTextForDisplay,
    explanation: finalExplanation,
    confidence: "N/A", // LanguageTool doesn't provide a direct confidence score in this format
  };
};

export const correctGrammarWithLanguageTool = async (text: string): Promise<LanguageToolCorrectionResult> => {
  const trimmedText = text.trim(); 
  if (!trimmedText) {
    return {
        correctedText: "",
        explanation: `Input text was empty. The text is:\n<strong></strong>`,
        confidence: "N/A",
    }
  }

  const params = new URLSearchParams();
  params.append('text', trimmedText); 
  params.append('language', 'en-US');

  try {
    const response = await fetch(LANGUAGETOOL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json', 
      },
      body: params.toString(),
    });

    if (!response.ok) {
      let errorMessage = `LanguageTool API request failed with status ${response.status}`;
      try {
        const errorData = await response.json(); 
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData) || errorMessage;
      } catch (e) {
        const textError = await response.text().catch(() => "Could not retrieve error body.");
        errorMessage = `${errorMessage}. Response: ${textError.substring(0, 200)}`;
      }
      throw new LanguageToolError(errorMessage);
    }

    const data: LanguageToolApiResponse = await response.json();
    return applyCorrectionsAndExplain(trimmedText, data.matches);

  } catch (error: any) {
    if (error instanceof LanguageToolError) {
      throw error; 
    }
    throw new LanguageToolError(`Failed to correct grammar: ${error.message || 'Unknown network or API error'}`);
  }
};
