
import React, { useState, useEffect, useRef } from 'react';
import { AppState, ProcessedData } from './types';
import { extractDataFromImages } from './services/geminiService';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { ReviewTable } from './components/ReviewTable';

const STORAGE_KEY = 'oral_gen_session';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [data, setData] = useState<ProcessedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  // Track if we are currently loading from storage to avoid immediate overwrite
  const isInitializing = useRef(true);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      try {
        const { savedData, savedAppState } = JSON.parse(savedSession);
        if (savedData && savedAppState) {
          setData(savedData);
          setAppState(savedAppState);
          setLastSaved(new Date().toLocaleTimeString());
        }
      } catch (e) {
        console.error("Failed to load saved session", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    isInitializing.current = false;
  }, []);

  // Save state to localStorage whenever data or appState changes
  useEffect(() => {
    if (isInitializing.current) return;

    if (appState === 'REVIEW' && data) {
      try {
        const session = JSON.stringify({ savedData: data, savedAppState: appState });
        localStorage.setItem(STORAGE_KEY, session);
        setLastSaved(new Date().toLocaleTimeString());
      } catch (e) {
        console.error("Failed to save session", e);
      }
    } else if (appState === 'IDLE') {
      localStorage.removeItem(STORAGE_KEY);
      setLastSaved(null);
    }
  }, [data, appState]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setAppState('PROCESSING');
    setError(null);

    try {
      const base64Promises = Array.from(files).map((file: File) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
              resolve(result);
            } else {
              reject(new Error("Failed to read file as base64 string"));
            }
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      });

      const base64Images = await Promise.all(base64Promises);
      const result = await extractDataFromImages(base64Images);
      setData(result);
      setAppState('REVIEW');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during processing.");
      setAppState('IDLE');
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to discard this session? All unsaved progress will be lost.")) {
      setData(null);
      setAppState('IDLE');
      localStorage.removeItem(STORAGE_KEY);
      setLastSaved(null);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    const headers = ["RIN", "Relation", "Sex", "Full Name", "Birth Date", "Birth Place", "Death Date", "Death Place"];
    const rows = data.individuals.map(ind => [
      ind.rin,
      ind.relation,
      ind.sex,
      `"${ind.fullName}"`,
      `"${ind.birthDate}"`,
      `"${ind.birthPlace}"`,
      `"${ind.deathDate}"`,
      `"${ind.deathPlace}"`
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `OralGen_${data.metadata.interviewId || 'Transcription'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Oral-Gen Transcription <span className="text-blue-600">Assistant</span></h1>
        </div>
        
        {appState === 'REVIEW' && (
          <div className="flex gap-4">
            <button 
              onClick={handleReset}
              className="text-gray-500 hover:text-red-600 font-medium text-sm px-4 py-2 transition-colors"
            >
              Reset Session
            </button>
            <button 
              onClick={exportCSV}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-all text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {appState === 'IDLE' && (
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <div className="mb-8">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Digitize Your Handwritten Oral Genealogy</h2>
              <p className="text-lg text-gray-600">
                Upload your 3-page interview PDF or photos of the table. Gemini AI will automatically extract the RINs, Names, Dates, and Places.
              </p>
            </div>

            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors group cursor-pointer relative shadow-sm">
              <input 
                type="file" 
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-4">
                <div className="text-blue-600 font-bold text-lg group-hover:scale-110 transition-transform">
                  Drag & Drop Files or Click to Browse
                </div>
                <div className="text-gray-400 text-sm">
                  Support for multi-page PDF or JPEG/PNG images
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-blue-600 font-bold mb-2">1. Scan & Upload</div>
                <p className="text-xs text-gray-500">Capture clear photos of the 3-page genealogical form.</p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-blue-600 font-bold mb-2">2. AI Processing</div>
                <p className="text-xs text-gray-500">Gemini 3 Pro reads handwriting and structures the data.</p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-blue-600 font-bold mb-2">3. Review & Export</div>
                <p className="text-xs text-gray-500">Your progress is automatically saved so you can resume later.</p>
              </div>
            </div>
          </div>
        )}

        {appState === 'PROCESSING' && <ProcessingOverlay />}

        {appState === 'REVIEW' && data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-100 px-4 py-2 rounded-lg">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Session auto-saved to your browser
              </span>
              {lastSaved && <span>Last saved: {lastSaved}</span>}
            </div>
            <ReviewTable data={data} onUpdate={setData} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-xs text-gray-400">
          Built for Oral-Gen Transcription Efficiency. Powered by Google Gemini AI.
        </div>
      </footer>
    </div>
  );
};

export default App;
