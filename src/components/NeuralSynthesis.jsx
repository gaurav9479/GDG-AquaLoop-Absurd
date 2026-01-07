import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BrainCircuit, Sparkles, Loader2 } from "lucide-react";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function NeuralSynthesis({ waterData, prediction }) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const synthesizeAnalysis = async () => {
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        As an AI Water Specialist, analyze this sample:
        - Parameters: ${JSON.stringify(waterData)}
        - ML Predicted Grade: ${prediction.predicted_grade}
        - Reuse Allowed: ${prediction.reuse_allowed}
        
        Provide a brief, 3-bullet point summary:
        1. Nature of this water (Why is it this grade?)
        2. Specific risks based on the parameters.
        3. Strategic further use cases or required treatment to improve it.
        Keep it professional and technical yet concise.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAnalysis(response.text());
    } catch (error) {
      console.error("Gemini Error:", error);
      setAnalysis("Synthesis failed. Check API Key or Connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-aqua-surface/60 border border-aqua-cyan/30 rounded-3xl p-6 mt-6 backdrop-blur-md relative overflow-hidden group">
      {/* Background Decoration */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-aqua-cyan/10 rounded-full blur-3xl group-hover:bg-aqua-cyan/20 transition-all duration-700" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-aqua-cyan animate-pulse" size={20} />
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
            Neural Synthesis Zone
          </h3>
        </div>
        <button 
          onClick={synthesizeAnalysis}
          disabled={loading || !prediction}
          className="flex items-center gap-2 bg-aqua-cyan/10 hover:bg-aqua-cyan/20 border border-aqua-cyan/40 px-3 py-1.5 rounded-full text-[9px] font-bold text-aqua-cyan uppercase tracking-tighter transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
          Generate Insights
        </button>
      </div>

      <div className="min-h-[100px] text-slate-300 text-xs leading-relaxed font-mono">
        {analysis ? (
          <div className="animate-in fade-in slide-in-from-top-2 duration-500 whitespace-pre-wrap">
            {analysis}
          </div>
        ) : (
          <p className="text-slate-600 italic">
            Click "Generate Insights" to run deep-learning analysis on current sample...
          </p>
        )}
      </div>
    </div>
  );
}