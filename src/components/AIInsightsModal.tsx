import React, { useState, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { ChatMessage } from '../types';
import {
  Sparkles,
  Bot,
  Send,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Lightbulb,
  Zap,
  ShieldCheck,
  User,
} from 'lucide-react';

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIInsightsModal: React.FC<AIInsightsModalProps> = ({ isOpen, onClose }) => {
  const { aiInsights, isGeneratingInsights, triggerAIInsights, queryCopilot } = useBusiness();

  const [activeTab, setActiveTab] = useState<'insights' | 'copilot'>('insights');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your StockSync AI Business Copilot. Ask me anything about stock optimization, automated reordering, demand forecasts, or customer order trends!',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [queryInput, setQueryInput] = useState('');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  useEffect(() => {
    if (isOpen && !aiInsights) {
      triggerAIInsights();
    }
  }, [isOpen, aiInsights, triggerAIInsights]);

  if (!isOpen) return null;

  const handleSendCopilotQuery = async (customPrompt?: string) => {
    const promptToSend = customPrompt || queryInput;
    if (!promptToSend.trim() || isCopilotThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setQueryInput('');
    setIsCopilotThinking(true);

    const answer = await queryCopilot(promptToSend, chatMessages);

    const assistantMsg: ChatMessage = {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content: answer,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, assistantMsg]);
    setIsCopilotThinking(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">StockSync AI Intelligence Suite</h3>
              <p className="text-xs text-slate-400">Powered by Gemini AI - Operational Insights & Copilot Assistant</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab switcher */}
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1 ${
                  activeTab === 'insights' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Actionable Insights</span>
              </button>
              <button
                onClick={() => setActiveTab('copilot')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1 ${
                  activeTab === 'copilot' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Copilot Assistant</span>
              </button>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
              ✕
            </button>
          </div>
        </div>

        {/* Tab 1: AI Actionable Insights */}
        {activeTab === 'insights' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200">
            {isGeneratingInsights ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-sm font-semibold text-slate-300">Analyzing inventory velocity, reorders & margin telemetry...</p>
                <p className="text-xs text-slate-500">Gemini AI is generating actionable operational recommendations</p>
              </div>
            ) : aiInsights ? (
              <>
                {/* Health Score & Refresh */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center font-bold text-2xl text-indigo-400">
                      {aiInsights.healthScore}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Inventory Health Index</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{aiInsights.executiveSummary}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerAIInsights()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 border border-slate-700 shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-Analyze</span>
                  </button>
                </div>

                {/* Top Alerts */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Operational Risk & Priority Alerts</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiInsights.topAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border space-y-1 ${
                          alert.type === 'critical'
                            ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                            : alert.type === 'warning'
                            ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                            : 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                        }`}
                      >
                        <h5 className="font-bold text-sm">{alert.title}</h5>
                        <p className="text-xs opacity-90 leading-relaxed">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demand Forecast */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span>Demand Forecasting & Stockout Risks</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{aiInsights.demandForecast}</p>
                </div>

                {/* Inventory Optimization Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span>SKU Stock Optimization Opportunities</span>
                  </h4>
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-800">
                        <tr>
                          <th className="p-3">SKU & Product</th>
                          <th className="p-3">AI Recommendation</th>
                          <th className="p-3 text-center">Impact Level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {aiInsights.stockOptimizations.map((opt, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-semibold text-white">
                              {opt.productName}
                              <span className="block font-mono text-indigo-400 text-[11px]">{opt.sku}</span>
                            </td>
                            <td className="p-3 text-slate-300">{opt.suggestion}</td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  opt.impact === 'High'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {opt.impact} Impact
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actionable Steps */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Actionable Operational Steps</span>
                  </h4>
                  <ul className="space-y-2">
                    {aiInsights.actionableSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Tab 2: AI Copilot Chat */}
        {activeTab === 'copilot' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {/* Quick Prompt Chips */}
            <div className="p-3 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto">
              <span className="text-[11px] font-semibold text-slate-500 shrink-0">Prompts:</span>
              {[
                'Which items will run out of stock first?',
                'How can we optimize our working capital?',
                'Analyze our customer orders and gross margins',
                'What automated reorders are pending?',
              ].map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendCopilotQuery(promptText)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded-full text-[11px] font-medium border border-slate-800 whitespace-nowrap transition-all"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-1 ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <span className="text-[10px] opacity-60 block text-right mt-1">{msg.timestamp}</span>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isCopilotThinking && (
                <div className="flex items-center space-x-2 text-xs text-indigo-400 p-2">
                  <Bot className="w-4 h-4 animate-bounce" />
                  <span>StockSync Copilot is formulating answer...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCopilotQuery();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="Ask StockSync Copilot about inventory levels, suppliers, reorder points..."
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!queryInput.trim() || isCopilotThinking}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1 shadow transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
