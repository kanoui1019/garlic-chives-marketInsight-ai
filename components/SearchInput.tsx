
import React, { useState } from 'react';
import { SearchIcon, ArrowRightIcon, HistoryIcon, TrashIcon } from './Icons';
import { AppState } from '../types';

interface SearchInputProps {
  onSearch: (topic: string) => void;
  isLoading: boolean;
  appState: AppState;
  history: string[];
  onClearHistory: () => void;
  // Model Config
  searchModel: string;
  onSearchModelChange: (model: string) => void;
  analyzeModel: string;
  onAnalyzeModelChange: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro' },
];

const SearchInput: React.FC<SearchInputProps> = ({ 
  onSearch, 
  isLoading, 
  appState, 
  history, 
  onClearHistory,
  searchModel,
  onSearchModelChange,
  analyzeModel,
  onAnalyzeModelChange
}) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSearch(topic);
    }
  };

  const isCompact = appState !== AppState.IDLE;

  return (
    <div className={`transition-all duration-700 ease-in-out w-full max-w-2xl mx-auto ${isCompact ? 'translate-y-0 opacity-100' : 'translate-y-[15vh] opacity-100'}`}>
      <div className={`text-center mb-8 transition-opacity duration-500 ${isCompact ? 'opacity-0 hidden' : 'opacity-100'}`}>
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4 tracking-tight">
          MarketInsight AI
        </h1>
        <p className="text-slate-400 text-lg">
          結合 Google 即時搜尋與 AI 模型的深度產業分析與估值
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group z-20">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800 p-2 shadow-2xl">
          <div className="pl-4 pr-2 text-slate-500">
            <SearchIcon className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="輸入公司或產業 (例如: 台積電, AI Server, TSLA)"
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none h-12 text-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!topic.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg p-3 transition-colors duration-200"
          >
             {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <ArrowRightIcon className="w-5 h-5" />
             )}
          </button>
        </div>
      </form>
      
      {!isCompact && history.length > 0 && (
        <div className="mt-6 animate-fade-in">
            <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <HistoryIcon className="w-3 h-3" />
                    最近搜尋
                </span>
                <button 
                    onClick={onClearHistory}
                    className="text-xs text-slate-600 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                    <TrashIcon className="w-3 h-3" />
                    清除
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {history.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSearch(item)}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-full text-sm text-slate-300 transition-all hover:border-slate-600"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
      )}
      
      {!isCompact && (
        <div className="mt-12 flex flex-col md:flex-row justify-center gap-6 text-sm text-slate-500">
           {/* Model Selection UI */}
           <div className="flex items-center gap-2 bg-slate-800/30 p-2 rounded-lg border border-slate-800/50">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider ml-2">搜尋模型</span>
              <select 
                value={searchModel}
                onChange={(e) => onSearchModelChange(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 outline-none focus:border-blue-500"
              >
                {AVAILABLE_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
           </div>

           <div className="flex items-center gap-2 bg-slate-800/30 p-2 rounded-lg border border-slate-800/50">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider ml-2">分析模型</span>
              <select 
                value={analyzeModel}
                onChange={(e) => onAnalyzeModelChange(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 outline-none focus:border-emerald-500"
              >
                {AVAILABLE_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
           </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
