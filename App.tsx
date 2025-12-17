import React, { useState } from 'react';
import { Zap, BarChart3, TrendingUp, GraduationCap, LayoutDashboard, BrainCircuit } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ConfigPanel from './components/ConfigPanel';
import ResultsDashboard from './components/ResultsDashboard';
import { OptimizerDashboard } from './components/OptimizerDashboard';
import { IEXDataPoint, SimulationResult, ConfigState } from './types';
import { runSimulation } from './services/predictionEngine';

const App: React.FC = () => {
    const [data, setData] = useState<IEXDataPoint[] | null>(null);
    const [results, setResults] = useState<SimulationResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'prediction' | 'optimization'>('prediction');
    
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
            {/* Header */}
            <div className="bg-zinc-950 border-b border-zinc-900 pt-8 pb-16 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950/0 to-transparent"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="flex items-center justify-center gap-4 mb-8 bg-zinc-900/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-zinc-800 shadow-xl inline-flex mx-auto">
                        <img src="https://upload.wikimedia.org/wikipedia/en/1/1c/IIT_Kharagpur_Logo.svg" alt="IIT Kgp" className="w-10 h-10 object-contain" />
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">IIT Kharagpur</p>
                            <p className="text-sm font-bold text-zinc-100">VGSoM Analytics Division</p>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
                        IEX DAM <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Suite Pro</span>
                    </h1>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800 p-8 mb-8">
                    <FileUpload onDataLoaded={handleDataLoaded} />
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
                    <>
                        {/* Tab Switcher */}
                        <div className="flex gap-2 p-1.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl mb-8 w-fit mx-auto">
                            <button 
                                onClick={() => setActiveTab('prediction')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'prediction' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <BrainCircuit size={18} /> Prediction Module
                            </button>
                            <button 
                                onClick={() => setActiveTab('optimization')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'optimization' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <LayoutDashboard size={18} /> Strategic Optimizer
                            </button>
                        </div>

                        {activeTab === 'prediction' ? (
                            <ResultsDashboard results={results} config={config} />
                        ) : (
                            <OptimizerDashboard results={results} />
                        )}
                    </>
                )}
            </main>

             <footer className="text-center text-zinc-600 text-sm pb-12 pt-16 mt-12 px-6 border-t border-zinc-900/50">
                <p className="font-bold text-zinc-400">© 2024 Vinod Gupta School of Management, IIT Kharagpur</p>
                <p className="mt-1">IEX Price Predictor & Strategic Optimizer • v2.1.0</p>
            </footer>
        </div>
    );
};

export default App;