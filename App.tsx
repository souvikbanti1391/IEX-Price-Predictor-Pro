import React, { useState } from 'react';
import { Zap, BarChart3, TrendingUp, GraduationCap } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ConfigPanel from './components/ConfigPanel';
import ResultsDashboard from './components/ResultsDashboard';
import { IEXDataPoint, SimulationResult, ConfigState } from './types';
import { runSimulation } from './services/predictionEngine';

const App: React.FC = () => {
    const [data, setData] = useState<IEXDataPoint[] | null>(null);
    const [results, setResults] = useState<SimulationResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [config, setConfig] = useState<ConfigState>({
        plotInterval: 7,
        forecastDays: 7,
        confidenceLevel: 95
    });

    const handleDataLoaded = (loadedData: IEXDataPoint[]) => {
        setData(loadedData);
        setResults(null); 
    };

    const handleRunAnalysis = async () => {
        if (!data) return;
        
        setIsProcessing(true);
        try {
            await new Promise(r => setTimeout(r, 1200));
            const simResults = await runSimulation(data, config.forecastDays, config.confidenceLevel);
            setResults(simResults);
        } catch (error) {
            console.error("Simulation failed", error);
            alert("An error occurred during analysis.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black pb-20 text-zinc-200">
            {/* Header with IIT Kgp Branding */}
            <div className="bg-zinc-950 border-b border-zinc-900 pt-8 pb-16 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950/0 to-transparent"></div>
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col items-center justify-center text-center">
                        {/* Institution Logo & Badge */}
                        <div className="flex items-center gap-4 mb-8 bg-zinc-900/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-zinc-800 shadow-xl">
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/en/1/1c/IIT_Kharagpur_Logo.svg" 
                                alt="IIT Kharagpur Logo" 
                                className="w-12 h-12 object-contain"
                            />
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">IIT Kharagpur</p>
                                <p className="text-sm font-bold text-zinc-100">VGSoM Analytics Engine</p>
                            </div>
                        </div>

                        {/* App Icon */}
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-2xl shadow-blue-500/20 mb-6 border border-white/10 ring-1 ring-white/5 animate-pulse">
                            <Zap size={32} className="text-white fill-white" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
                            IEX DAM Price Predictor <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Pro</span>
                        </h1>
                        <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed">
                            Vinod Gupta School of Management's proprietary multi-model forecasting engine. 
                            Automated algorithm selection for high-fidelity electricity price forecasting.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/80 border border-zinc-800 p-8 mb-8">
                    <FileUpload onDataLoaded={handleDataLoaded} />
                    
                    {data && (
                        <div className="mt-6 flex flex-wrap items-center justify-between text-sm text-zinc-400 bg-black/40 p-4 rounded-xl border border-zinc-800/50">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <BarChart3 size={16} className="text-blue-500" />
                                    <span className="font-semibold text-zinc-300">Dataset Volume:</span> {data.length.toLocaleString()}
                                </div>
                                <div className="w-px h-4 bg-zinc-800 hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={16} className="text-emerald-500" />
                                    <span className="font-semibold text-zinc-300">Span:</span> {data[0].date} — {data[data.length-1].date}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 md:mt-0 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-wider">
                                <GraduationCap size={14} /> VGSoM Research Project
                            </div>
                        </div>
                    )}
                </div>

                {data && (
                    <ConfigPanel 
                        config={config} 
                        setConfig={setConfig} 
                        onRun={handleRunAnalysis}
                        isProcessing={isProcessing}
                        disabled={false}
                    />
                )}

                {results && (
                    <ResultsDashboard results={results} config={config} />
                )}
            </main>

             <footer className="text-center text-zinc-600 text-sm pb-12 pt-8 border-t border-zinc-900/50 mt-12 px-6">
                <div className="flex items-center justify-center gap-6 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                     <img src="https://upload.wikimedia.org/wikipedia/en/1/1c/IIT_Kharagpur_Logo.svg" alt="IIT KGP" className="h-10" />
                </div>
                <p className="font-bold text-zinc-400">© 2024 Vinod Gupta School of Management, IIT Kharagpur</p>
                <p className="mt-1">IEX Price Predictor Pro Engine • Research & Analytics Division</p>
                <p className="mt-4 font-black text-zinc-700 uppercase tracking-[0.3em] text-[10px]">Developer: SouvikM</p>
            </footer>
        </div>
    );
};

export default App;