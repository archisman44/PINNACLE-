
import React, { useState, useEffect, useCallback } from 'react';
import { TextInputArea } from './components/TextInputArea';
import { Button } from './components/Button';
import { ResultDisplay } from './components/ResultDisplay';
import { Toast } from './components/Toast';
import { correctGrammarWithLanguageTool, LanguageToolError } from './services/languageToolService'; // Updated import
import { LoadingSpinnerIcon } from './components/icons/LoadingSpinnerIcon';
import { LanguageToolCorrectionResult } from './types'; // Updated import

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [correctionResult, setCorrectionResult] = useState<LanguageToolCorrectionResult | null>(null); // Updated type
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);

  const displayError = (message: string) => {
    setError(message);
    setShowToast(true);
  };
  
  const handleSubmit = useCallback(async () => {
    if (!inputText.trim()) {
      displayError('Input text cannot be empty.');
      return;
    }

    setIsLoading(true);
    setOriginalText(inputText);
    setCorrectionResult(null); 
    setError(null);

    try {
      const result = await correctGrammarWithLanguageTool(inputText); // Use LanguageTool service
      if (result) {
        setCorrectionResult(result);
      } else {
        // This case should ideally be handled by an error throw in the service if no result means error
        displayError('Failed to get correction. The AI service might have returned an unparsable response.');
      }
    } catch (err) {
      if (err instanceof LanguageToolError) { // Updated error type
        displayError(`LanguageTool Service Error: ${err.message}`);
      } else if (err instanceof Error) {
        displayError(`An unexpected error occurred: ${err.message}`);
      } else {
        displayError('An unknown error occurred while contacting the AI service.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  const handleClear = useCallback(() => {
    setInputText('');
    setOriginalText('');
    setCorrectionResult(null);
    setError(null);
    setShowToast(false);
    setIsLoading(false); // Reset loading state if clear is pressed during a hypothetical stuck loading
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setShowToast(false);
        // setError(null); // Optionally clear the error after toast hides
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [error]);

  const canClear = inputText.length > 0 || originalText.length > 0 || correctionResult !== null || error !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      <main className="bg-gray-800 bg-opacity-80 backdrop-blur-md shadow-2xl rounded-xl p-6 md:p-10 w-full max-w-2xl transform transition-all duration-500 hover:scale-[1.01]">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            AI Text Corrector
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Refine your writing with AI-powered suggestions.
          </p>
        </header>

        <section className="mb-6">
          <TextInputArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to correct..."
            disabled={isLoading}
            aria-label="Text input for grammar correction"
          />
        </section>

        <section className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={handleSubmit} disabled={isLoading || !inputText.trim()} aria-label="Correct my text button">
            {isLoading ? (
              <>
                <LoadingSpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Correcting...
              </>
            ) : (
              'Correct My Text'
            )}
          </Button>
          <Button 
            onClick={handleClear} 
            disabled={!canClear || isLoading} 
            aria-label="Clear input and results button"
            className="bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800" // Different style for clear
          >
            Clear
          </Button>
        </section>
        
        {correctionResult && !isLoading && (
          <ResultDisplay 
            originalText={originalText} 
            correctedText={correctionResult.correctedText}
            // confidence prop removed
            explanation={correctionResult.explanation}
          />
        )}

      </main>
      
      <footer className="mt-8 text-center text-gray-500 text-xs">
        <p>&copy; {new Date().getFullYear()} AI Text Corrector. Powered by LanguageTool.</p> {/* Updated credit */}
      </footer>

      <Toast
        message={error || ''}
        show={showToast}
        onClose={() => setShowToast(false)}
        type="error"
      />
    </div>
  );
};

export default App;
