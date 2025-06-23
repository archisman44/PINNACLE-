
// types.ts

export interface LanguageToolCorrectionResult {
  correctedText: string;
  confidence: string; // Will be "N/A" for LanguageTool
  explanation: string;
}

// For LanguageTool API's /v2/check response
export interface LanguageToolReplacement {
  value: string;
  // Other properties like 'shortDescription' might exist
}

export interface LanguageToolMatch {
  message: string;
  shortMessage?: string;
  replacements: LanguageToolReplacement[];
  offset: number;
  length: number;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  sentence: string;
  rule?: {
    id: string;
    description: string;
    issueType?: string;
    category?: {
      id: string;
      name: string;
    };
    // isPremium?: boolean;
  };
  // Other properties like type, contextForSureMatch might exist
}

export interface LanguageToolSoftwareInfo {
    name: string;
    version: string;
    buildDate: string;
    apiVersion: number;
    premium: boolean;
    premiumHint: string;
    status: string;
}

export interface LanguageToolLanguageInfo {
    name: string;
    code: string;
    detectedLanguage: {
        name: string;
        code: string;
        confidence: number;
    };
}

export interface LanguageToolApiResponse {
  software: LanguageToolSoftwareInfo;
  warnings?: {
    incompleteResults: boolean;
  };
  language: LanguageToolLanguageInfo;
  matches: LanguageToolMatch[];
  // Other potential top-level fields
}


// For LanguageTool API's error response (can be kept general or specified if known)
// LanguageTool typically returns HTML for errors or non-JSON for certain issues,
// so a generic error structure might be less useful than handling response.text().
// However, if it does return JSON errors for some cases:
export interface LanguageToolAPIErrorResponse {
  error?: string; // Or a more specific structure if known
  message?: string;
  // other fields from LanguageTool error response if needed
}


// Hugging Face Types - Kept for potential future use or if other parts rely on them
export type GrammarCorrectionResponse = Array<{
  generated_text: string;
}>;

export interface HuggingFaceErrorResponse {
  error?: string;
  estimated_time?: number;
  // Other potential Hugging Face error fields
}
