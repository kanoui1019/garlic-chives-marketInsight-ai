
import { GoogleGenAI, Type } from "@google/genai";
import { NewsData, AnalysisData, Source } from "../types";

// Helper to clean Markdown code blocks from JSON string
const cleanJsonString = (text: string): string => {
  if (!text) return "{}";
  let clean = text.replace(/```json\n?/g, '').replace(/```/g, '');
  return clean.trim();
};

/**
 * Step 1: Search for real-time news using the selected Gemini model with Google Search Grounding.
 */
export const searchIndustryNews = async (topic: string, apiKey: string, modelId: string = 'gemini-2.5-flash'): Promise<NewsData> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Prompt updated to verify accuracy, look for broker reports AND Technical Indicators
    const prompt = `
      Find the latest and most significant news, financial reports, and market trends regarding "${topic}".
      
      CRITICAL DATA VERIFICATION TASK:
      1. Search for **Investment Bank Research Reports** (e.g., Morgan Stanley, Goldman Sachs, JP Morgan) and **Local Broker Reports**.
      2. Find "Consensus EPS Estimates" vs "Actuals".
      3. Look for **Divergence in Price Targets** (Highest vs Lowest targets).
      
      TECHNICAL ANALYSIS DATA NEEDED:
      - **Moving Averages**: Find current 20-day (MA20) and 60-day (MA60) moving average prices.
      - **Price Action**: Recent support and resistance levels.
      - **Trend**: Is the stock above or below these MAs?
      
      If "${topic}" is a public company, you MUST find:
      - Current Stock Price.
      - Next 12M EPS Forecasts.
      - Analyst Ratings (Buy/Sell/Hold counts).
      
      Output Requirement:
      Summarize the key events, stock performance, technical levels, and **specifically mention which brokers/institutions provided the data**.
      **You MUST write the summary in Traditional Chinese (繁體中文).**
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summary = response.text || "無法取得摘要。";
    
    // Extract grounding chunks to get source URLs
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Source[] = [];

    groundingChunks.forEach(chunk => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || "Web Source",
          uri: chunk.web.uri || "#"
        });
      }
    });

    // Deduplicate sources based on URI
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      summary,
      sources: uniqueSources
    };

  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error(`無法搜尋產業新聞 (${modelId})，請確認 API Key 是否正確或稍後再試。`);
  }
};

/**
 * Step 2: Analyze the gathered news using the selected Gemini model for verified financial modeling and technical analysis.
 */
export const analyzeProspects = async (topic: string, newsSummary: string, apiKey: string, modelId: string = 'gemini-3-pro-preview'): Promise<AnalysisData> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      扮演一位極度嚴謹的華爾街高級金融分析師與技術分析專家 (CMT)。
      
      根據以下關於 "${topic}" 的新聞摘要與卷商報告數據：
      "${newsSummary}"

      請執行以下任務 (必須使用繁體中文回答)：
      
      1. **數據驗證與比對 (Data Verification)**:
         - 仔細比對不同來源的數據 (例如：摩根大通看多，但高盛看空)。
         - 找出市場共識 (Consensus) 與極端值。
         
      2. **財務預測 (Financial Forecasting)**: 
         - **EPS 預期**: 提供未來 12-24 個月的 EPS 成長預測。若有卷商具體數據，請引用。
         - **合理股價計算**: 綜合各家卷商目標價，計算 "加權平均合理價"。
         - **漲幅空間**: 計算目前股價相對於合理價的潛在漲幅。

      3. **技術面策略 (Granville's Rules & MA Theory)**:
         - 根據葛蘭碧八大法則 (Granville's 8 Rules) 與均線理論 (MA20/MA60) 分析目前走勢。
         - 判斷目前是處於買進訊號 (如: 黃金交叉、乖離過大回檔、均線支撐) 還是賣出訊號。
         - **給出具體的建議買入價格區間 (Entry Zone)** 與 **停損點 (Stop Loss)**。

      4. **綜合策略分析**:
         - 結合基本面與技術面，分析產業前景與投資風險。

      JSON Output Format:
      - strictly follow the schema.
      - 'technicalAnalysis.signal': Must be 'BUY', 'SELL', or 'HOLD'.
      - 'technicalAnalysis.suggestedEntryZone': specific numbers (e.g., "105.0 - 108.5").
      - 'technicalAnalysis.granvilleReasoning': Explain strictly using Granville's rules (e.g., "股價突破翻揚的 20日均線 (法則1)").
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysisContent: {
              type: Type.STRING,
              description: "Markdown formatted text in Traditional Chinese containing Verified Industry Outlook, Profitability Forecast, Strategic Opportunities & Risks."
            },
            financials: {
              type: Type.OBJECT,
              properties: {
                epsForecast: { type: Type.STRING, description: "Projected EPS figures with source citation" },
                fairValue: { type: Type.STRING, description: "Calculated fair share price based on consensus" },
                currentPrice: { type: Type.STRING, description: "Current market price" },
                upsidePotential: { type: Type.STRING, description: "Percentage difference (e.g. '+20.3%')" },
                valuationMethod: { type: Type.STRING, description: "Method used" },
                analystConsensus: { type: Type.STRING, description: "Summary of broker consensus sentiment" },
                dataVerification: { type: Type.STRING, description: "Notes on data accuracy and source discrepancies" }
              },
              required: ["epsForecast", "fairValue", "currentPrice", "upsidePotential", "valuationMethod", "analystConsensus", "dataVerification"]
            },
            technicalAnalysis: {
              type: Type.OBJECT,
              properties: {
                signal: { type: Type.STRING, enum: ["BUY", "SELL", "HOLD"], description: "Overall Signal" },
                signalContext: { type: Type.STRING, description: "Brief context (e.g. 'Granville Rule #3: Support at MA20')" },
                ma20: { type: Type.STRING, description: "Estimated 20-day Moving Average price" },
                ma60: { type: Type.STRING, description: "Estimated 60-day Moving Average price" },
                suggestedEntryZone: { type: Type.STRING, description: "Recommended price range to buy" },
                stopLossPrice: { type: Type.STRING, description: "Recommended stop loss price" },
                granvilleReasoning: { type: Type.STRING, description: "Explanation based on moving average theory" }
              },
              required: ["signal", "signalContext", "ma20", "ma60", "suggestedEntryZone", "stopLossPrice", "granvilleReasoning"]
            }
          }
        }
      },
    });

    const cleanText = cleanJsonString(response.text || "{}");
    const json = JSON.parse(cleanText);

    return {
      content: json.analysisContent || "無法產生分析報告。",
      financialForecast: json.financials,
      technicalAnalysis: json.technicalAnalysis
    };

  } catch (error) {
    console.error("Error analyzing prospects:", error);
    throw new Error(`無法產生策略分析 (${modelId})，請稍後再試。`);
  }
};
