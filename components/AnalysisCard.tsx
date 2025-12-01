
import React, { useState, useEffect } from 'react';
import { AnalysisData } from '../types';
import { ChartIcon, SparklesIcon, CopyIcon } from './Icons';
import MarkdownRenderer from './MarkdownRenderer';

interface AnalysisCardProps {
  data: AnalysisData;
  isLoading: boolean;
  modelUsed: string;
}

const LOADING_MESSAGES = [
  "正在比對各大卷商報告...",
  "驗證財務數據準確性...",
  "計算葛蘭碧八大法則訊號...",
  "分析師評級交叉比對中...",
  "生成策略建議報告..."
];

const AnalysisCard: React.FC<AnalysisCardProps> = ({ data, isLoading, modelUsed }) => {
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Dynamic Loading Message
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
      return () => clearInterval(interval);
    } else {
        setLoadingMsgIndex(0);
    }
  }, [isLoading]);

  const handleCopy = () => {
    if (!data.content) return;
    
    // Construct text to copy
    let financials = '';
    if (data.financialForecast) {
      financials += `
[財務預測與驗證]
目前股價: ${data.financialForecast.currentPrice}
合理股價: ${data.financialForecast.fairValue} (${data.financialForecast.valuationMethod})
潛在漲幅: ${data.financialForecast.upsidePotential}
EPS 預估: ${data.financialForecast.epsForecast}
法人共識: ${data.financialForecast.analystConsensus}
數據驗證: ${data.financialForecast.dataVerification}
`;
    }
    
    let technicals = '';
    if (data.technicalAnalysis) {
        technicals += `
[技術面分析 - 葛蘭碧法則]
訊號: ${data.technicalAnalysis.signal} (${data.technicalAnalysis.signalContext})
建議買入區間: ${data.technicalAnalysis.suggestedEntryZone}
停損點: ${data.technicalAnalysis.stopLossPrice}
MA20: ${data.technicalAnalysis.ma20} | MA60: ${data.technicalAnalysis.ma60}
分析邏輯: ${data.technicalAnalysis.granvilleReasoning}
`;
    }

    const textToCopy = `MarketInsight AI 分析報告 (${modelUsed})\n\n${financials}\n${technicals}\n[策略分析]\n${data.content}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const getModelDisplayName = (id: string) => {
      if (id.includes('flash')) return 'GEMINI 2.5 FLASH';
      if (id.includes('pro')) return 'GEMINI 3 PRO';
      return id.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        
        <div className="relative z-10 text-center">
            <SparklesIcon className="w-10 h-10 text-emerald-500 animate-pulse mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2 transition-all duration-500 ease-in-out">
                {LOADING_MESSAGES[loadingMsgIndex]}
            </h3>
            <p className="text-slate-400">
                {getModelDisplayName(modelUsed)} 正在驗證市場數據...
            </p>
        </div>
      </div>
    );
  }

  if (!data.content) return null;

  const isPositiveUpside = data.financialForecast?.upsidePotential.includes('+') || 
                           (!data.financialForecast?.upsidePotential.includes('-') && data.financialForecast?.upsidePotential !== 'N/A');

  // Helper to extract number for visual gauge
  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 0;
    const match = priceStr.replace(/,/g, '').match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[0]) : 0;
  };

  const currentPriceVal = parsePrice(data.financialForecast?.currentPrice);
  const fairValueVal = parsePrice(data.financialForecast?.fairValue);
  
  // Calculate percentage position for gauge
  const maxVal = Math.max(currentPriceVal, fairValueVal) * 1.2;
  const currentPct = maxVal > 0 ? (currentPriceVal / maxVal) * 100 : 0;
  const fairPct = maxVal > 0 ? (fairValueVal / maxVal) * 100 : 0;

  // Technical Signal Color Logic
  const getSignalColor = (signal?: string) => {
      if (signal === 'BUY') return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
      if (signal === 'SELL') return 'text-red-400 border-red-500/50 bg-red-500/10';
      return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Financial Dashboard */}
      {data.financialForecast && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl backdrop-blur-sm flex flex-col justify-between">
            <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">目前股價 (Current)</p>
                <p className="text-2xl font-bold text-white">{data.financialForecast.currentPrice}</p>
            </div>
            {/* Visual Gauge */}
            {currentPriceVal > 0 && fairValueVal > 0 && (
                <div className="mt-3">
                    <div className="h-1.5 w-full bg-slate-700 rounded-full relative">
                        {/* Current Marker */}
                        <div 
                            className="absolute h-3 w-1 bg-white rounded-full -top-0.5 shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10 transition-all duration-1000"
                            style={{ left: `${Math.min(currentPct, 95)}%` }}
                            title="目前股價"
                        />
                         {/* Fair Value Marker */}
                        <div 
                            className="absolute h-3 w-1 bg-blue-400 rounded-full -top-0.5 z-0 opacity-70"
                            style={{ left: `${Math.min(fairPct, 95)}%` }}
                            title="合理股價"
                        />
                        <div 
                             className={`absolute h-full rounded-full opacity-30 ${isPositiveUpside ? 'bg-emerald-500' : 'bg-red-500'}`}
                             style={{ 
                                 left: `${Math.min(Math.min(currentPct, fairPct), 95)}%`, 
                                 width: `${Math.abs(fairPct - currentPct)}%` 
                             }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-slate-500">0</span>
                        <span className="text-[10px] text-blue-400">Target</span>
                    </div>
                </div>
            )}
          </div>
          
          <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl backdrop-blur-sm">
             <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">合理目標價 (Fair Value)</p>
             <p className="text-2xl font-bold text-blue-400">{data.financialForecast.fairValue}</p>
             <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{data.financialForecast.valuationMethod}</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl backdrop-blur-sm">
             <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">EPS 營收預期</p>
             <p className="text-lg font-bold text-white">{data.financialForecast.epsForecast}</p>
          </div>

          <div className={`bg-slate-800/60 border p-4 rounded-xl backdrop-blur-sm ${isPositiveUpside ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
             <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${isPositiveUpside ? 'text-emerald-400' : 'text-red-400'}`}>潛在漲幅空間 (Upside)</p>
             <p className={`text-2xl font-bold ${isPositiveUpside ? 'text-emerald-400' : 'text-red-400'}`}>
                {data.financialForecast.upsidePotential}
             </p>
          </div>

          {/* New Verification Section spanning full width on md+ */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl backdrop-blur-sm grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <p className="text-xs text-blue-300 uppercase tracking-wider font-semibold mb-1">法人共識 (Analyst Consensus)</p>
                 <p className="text-sm text-slate-300 leading-relaxed">{data.financialForecast.analystConsensus}</p>
              </div>
              <div>
                 <p className="text-xs text-orange-300 uppercase tracking-wider font-semibold mb-1">數據驗證 (Data Verification)</p>
                 <p className="text-sm text-slate-300 leading-relaxed">{data.financialForecast.dataVerification}</p>
              </div>
          </div>
        </div>
      )}

      {/* NEW: Technical Analysis Section */}
      {data.technicalAnalysis && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <h3 className="text-sm font-bold text-purple-200 uppercase tracking-wide">技術面策略 (Granville's 8 Rules)</h3>
            </div>
            <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Signal Badge & Context */}
                <div className="lg:col-span-1 flex flex-col justify-center items-center p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <div className={`px-4 py-1.5 rounded-full border text-sm font-bold mb-3 ${getSignalColor(data.technicalAnalysis.signal)}`}>
                        {data.technicalAnalysis.signal === 'BUY' && '● 買進訊號 (BUY)'}
                        {data.technicalAnalysis.signal === 'SELL' && '● 賣出訊號 (SELL)'}
                        {data.technicalAnalysis.signal === 'HOLD' && '● 觀望/持倉 (HOLD)'}
                    </div>
                    <p className="text-center text-slate-300 font-medium text-sm">
                        {data.technicalAnalysis.signalContext}
                    </p>
                </div>

                {/* Entry & Stop Loss & MAs */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                         <div className="bg-slate-800/50 p-3 rounded-lg border-l-2 border-emerald-500">
                             <p className="text-[10px] text-slate-400 uppercase">建議買入區間 (Entry Zone)</p>
                             <p className="text-lg font-bold text-white font-mono">{data.technicalAnalysis.suggestedEntryZone}</p>
                         </div>
                         <div className="bg-slate-800/50 p-3 rounded-lg border-l-2 border-red-500">
                             <p className="text-[10px] text-slate-400 uppercase">停損價格 (Stop Loss)</p>
                             <p className="text-lg font-bold text-white font-mono">{data.technicalAnalysis.stopLossPrice}</p>
                         </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-800/30 p-3 rounded-lg">
                            <span className="text-xs text-slate-400">MA20 (月線)</span>
                            <span className="text-sm font-mono text-blue-300">{data.technicalAnalysis.ma20}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/30 p-3 rounded-lg">
                            <span className="text-xs text-slate-400">MA60 (季線)</span>
                            <span className="text-sm font-mono text-purple-300">{data.technicalAnalysis.ma60}</span>
                        </div>
                         <div className="mt-2">
                             <p className="text-[10px] text-slate-500 leading-tight">
                                *分析邏輯: {data.technicalAnalysis.granvilleReasoning}
                             </p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Main Analysis Content */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <ChartIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">策略分析報告</h2>
           </div>
           
           <div className="flex items-center gap-3">
               <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-all active:scale-95"
               >
                  {isCopied ? (
                      <span className="text-emerald-400">已複製!</span>
                  ) : (
                      <>
                        <CopyIcon className="w-4 h-4" />
                        <span>複製報告</span>
                      </>
                  )}
               </button>
               <span className="text-xs font-mono text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded bg-emerald-500/5 hidden sm:inline-block">
                   {getModelDisplayName(modelUsed)}
               </span>
           </div>
        </div>
        
        <div className="p-8">
          <MarkdownRenderer content={data.content} />
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;
