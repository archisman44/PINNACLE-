
import React, { useState, useEffect } from 'react';

interface ResultDisplayProps {
  originalText: string;
  correctedText: string;
  // confidence: string; // Confidence is no longer displayed as per new format
  explanation: string;
}

const AnimatedText: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    if (text) {
      setDisplayedText('');
      setIsAnimationComplete(false);
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(intervalId);
          setIsAnimationComplete(true);
        }
      }, 20); // Adjust typing speed as needed
      return () => clearInterval(intervalId);
    } else {
      setDisplayedText(''); // Clear if text is empty
      setIsAnimationComplete(true);
    }
  }, [text]);

  return (
    <div className="p-4 bg-gray-700 bg-opacity-40 rounded-md whitespace-pre-wrap break-words text-gray-300 min-h-[4em]">
      {displayedText}
      {!isAnimationComplete && <span className="inline-block w-2 h-5 bg-purple-400 animate-pulse ml-1"></span>}
    </div>
  );
};


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  originalText, 
  correctedText,
  // confidence, // No longer used
  explanation
}) => {

  if (!originalText && !correctedText && (!explanation || explanation.includes("Input text was empty."))) {
    return null;
  }

  return (
    <div className="space-y-6 mt-8">
      {originalText && (
        <div>
          <h3 className="text-lg font-semibold text-purple-400 mb-2">📝 Original Text:</h3>
          <div className="p-4 bg-gray-700 bg-opacity-40 rounded-md whitespace-pre-wrap break-words text-gray-300">
            {originalText}
          </div>
        </div>
      )}
      
      {correctedText && (
         <div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">✅ Corrected Text Only:</h3>
          <AnimatedText text={correctedText} />
        </div>
      )}

      {/* Confidence display is removed */}

      {explanation && (
        <div>
          <h3 className="text-lg font-semibold text-yellow-400 mb-1">📘 Explanation:</h3>
          <div 
            className="p-3 bg-gray-700 bg-opacity-30 rounded-md text-gray-300 whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: explanation }}
          />
        </div>
      )}
    </div>
  );
};
