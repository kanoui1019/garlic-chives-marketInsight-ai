
import React, { useState, useEffect } from 'react';
import { AppState, NewsData, AnalysisData } from './types';
import { searchIndustryNews, analyzeProspects } from './services/geminiService';
import SearchInput from './components/SearchInput';
import NewsCard from './components/NewsCard';
import AnalysisCard from './components/AnalysisCard';
import ApiKeyModal from './components/ApiKeyModal';
import { KeyIcon } from './components/Icons';

const HISTORY_KEY = 'market_insight_history';
const API_KEY_STORAGE = 'gemini_api_key';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Model Configuration State
  const [searchModel, setSearchModel] = useState<string>('gemini-2.5-flash');
  const [analyzeModel, setAnalyzeModel] = useState<string>('gemini-3-pro-preview');
  
  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Load history and API key on mount
  useEffect(() => {
    // History
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }

    // API Key
    const savedKey = localStorage.getItem(API_KEY_STORAGE);
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setIsKeyModalOpen(true);
    }
  }, []);

  const saveToHistory = (topic: string) => {
    setSearchHistory(prev => {
      const newHistory = [topic, ...prev.filter(t => t !== topic)].slice(0, 5); // Keep top 5 unique
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
    setIsKeyModalOpen(false);
  };

  const handleSearch = async (topic: string) => {
    if (!apiKey) {
      setIsKeyModalOpen(true);
      return;
    }

    setAppState(AppState.SEARCHING);
    setErrorMsg(null);
    setNewsData(null);
    setAnalysisData(null);

    // Save search immediately
    saveToHistory(topic);

    try {
      // Step 1: Search News using selected search model
      const news = await searchIndustryNews(topic, apiKey, searchModel);
      setNewsData(news);
      
      // Step 2: Analyze using selected analysis model
      setAppState(AppState.ANALYZING);
      const analysis = await analyzeProspects(topic, news.summary, apiKey, analyzeModel);
      setAnalysisData(analysis);
      
      setAppState(AppState.COMPLETED);

    } catch (error: any) {
      setAppState(AppState.ERROR);
      setErrorMsg(error.message || "發生意外錯誤。");
      
      // If error might be auth related, suggest checking key
      if (error.message?.includes('API Key') || error.message?.includes('403') || error.message?.includes('400')) {
        setTimeout(() => setIsKeyModalOpen(true), 2000);
      }
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setNewsData(null);
    setAnalysisData(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ApiKeyModal 
        isOpen={isKeyModalOpen} 
        onSave={handleSaveApiKey} 
        onClose={() => setIsKeyModalOpen(false)}
        hasKey={!!apiKey}
      />

      <header className="py-6 px-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur fixed w-full z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div 
                className="text-xl font-bold text-white cursor-pointer flex items-center gap-2"
                onClick={handleReset}
            >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                    <span className="text-white font-mono font-bold">M</span>
                </div>
                MarketInsight AI
            </div>
            
            <div className="flex items-center gap-4">
              {appState === AppState.COMPLETED && (
                  <button 
                      onClick={handleReset}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                      重新搜尋
                  </button>
              )}
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
                title="設定 API Key"
              >
                <KeyIcon className="w-4 h-4" />
              </button>
            </div>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          
          <SearchInput 
            onSearch={handleSearch} 
            isLoading={appState === AppState.SEARCHING || appState === AppState.ANALYZING} 
            appState={appState}
            history={searchHistory}
            onClearHistory={clearHistory}
            // Model Props
            searchModel={searchModel}
            onSearchModelChange={setSearchModel}
            analyzeModel={analyzeModel}
            onAnalyzeModelChange={setAnalyzeModel}
          />

          {errorMsg && (
            <div className="mt-8 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-200 text-center animate-fade-in flex flex-col items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          {(appState === AppState.SEARCHING || newsData) && (
             <div className="mt-12 space-y-12 animate-fade-in-up">
                {/* Step 1: News Result */}
                {newsData && (
                  <section>
                    <NewsCard data={newsData} />
                  </section>
                )}

                {/* Step 2: Analysis Result */}
                {(appState === AppState.ANALYZING || analysisData) && (
                   <section>
                     <AnalysisCard 
                        data={analysisData || { content: '' }} 
                        isLoading={appState === AppState.ANALYZING}
                        modelUsed={analyzeModel}
                     />
                   </section>
                )}
             </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-slate-600 text-sm border-t border-slate-800/50">
        <p>Powered by Google Gemini 2.5 Flash & Gemini 3 Pro</p>
      </footer>
    </div>
  );
};

export default App;
