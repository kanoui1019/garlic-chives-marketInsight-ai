import React, { useState, useEffect } from 'react';
import { KeyIcon } from './Icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
  hasKey: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, hasKey }) => {
  const [inputKey, setInputKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load existing key into input if modifying
      const stored = localStorage.getItem('gemini_api_key');
      if (stored) setInputKey(stored);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSave(inputKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <KeyIcon className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">設定 Gemini API Key</h2>
            <p className="text-slate-400 text-sm">請輸入您的 Google Gemini API 金鑰</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              API Key
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              required
            />
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400 leading-relaxed border border-slate-800">
            <span className="text-blue-400 font-semibold">隱私說明：</span>
            您的 API Key 僅會儲存在您瀏覽器的 Local Storage 中，不會傳送至任何第三方伺服器。
            此 App 直接從您的瀏覽器呼叫 Google Gemini API。
          </div>

          <div className="flex gap-3 pt-2">
            {hasKey && (
               <button
                 type="button"
                 onClick={onClose}
                 className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium"
               >
                 取消
               </button>
            )}
            <button
              type="submit"
              disabled={!inputKey.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasKey ? '更新金鑰' : '開始使用'}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
            <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
            >
                取得 Google Gemini API Key &rarr;
            </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;