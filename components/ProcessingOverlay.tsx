
import React from 'react';

export const ProcessingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing PDF</h2>
        <p className="text-gray-600 text-center mb-6">
          Converting pages, detecting table structure, and reading handwriting with Gemini AI...
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse w-full"></div>
        </div>
        <p className="mt-4 text-xs text-gray-400 italic">This usually takes 15-30 seconds.</p>
      </div>
    </div>
  );
};
