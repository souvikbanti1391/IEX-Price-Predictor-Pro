import React from 'react';
import { ShoppingCart, ZapOff, TrendingDown, ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import { SimulationResult } from '../types';

interface OptimizerProps {
    results: SimulationResult;
}

export const OptimizerDashboard: React.FC<OptimizerProps> = ({ results }) => {
    const opt = results.optimization;
    if (!opt) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Strategy Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-gradient-to-br from-zinc-900 to-black p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingDown size={120} className="text-emerald-500" />
                    </div>
                    <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4">Strategic Recommendation</h3>
                    <h2 className="text-3xl font-black text-white mb-6">Optimized Load Shifting</h2>
                    <p className="text-zinc-400 max-w-xl leading-relaxed mb-8">
                        Based on forecasted price volatility, shifting <span className="text-white font-bold">30% of demand</span> to the identified low-cost windows could yield an estimated saving of <span className="text-emerald-400 font-bold">{opt.projectedSavingsPercent.toFixed(1)}%</span> on procurement costs.
                    </p>
                    <div className="flex gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                            <span className="text-[10px] text-emerald-500 font-bold uppercase block">Projected Savings</span>
                            <span className="text-xl font-black text-white">₹ {(opt.averageForecastedPrice * 0.15).toFixed(2)}/kWh</span>
                        </div>
                        <div className="bg-zinc-800/50 border border-zinc-700 px-4 py-2 rounded-xl">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Risk Level</span>
                            <span className={`text-xl font-black ${opt.volatilityRisk === 'High' ? 'text-red-500' : 'text-blue-500'}`}>
                                {opt.volatilityRisk}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-zinc-800 rounded-2xl">
                            <ShieldAlert className="text-amber-500" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold">Volatility Guard</h4>
                            <p className="text-xs text-zinc-500">Auto-adjusting thresholds</p>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-400 mb-6 italic">
                        "Market conditions suggest a {opt.volatilityRisk.toLowerCase()} risk profile. Tighten stop-loss for intraday bidding."
                    </p>
                    <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-all border border-zinc-700">
                        Download Strategy PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Buy Windows */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-emerald-500/5">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="text-emerald-500" size={20} />
                            <h3 className="font-bold text-zinc-100">Top Buy Windows</h3>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">OPTIMAL</span>
                    </div>
                    <div className="divide-y divide-zinc-800">
                        {opt.optimalBuyWindows.map((item, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-850 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-200">{item.time}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                            <Clock size={10} /> Procurement Block
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-emerald-400">₹{item.price.toFixed(2)}</p>
                                    <p className="text-[10px] text-zinc-600">per kWh</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Peak Shaving */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-red-500/5">
                        <div className="flex items-center gap-3">
                            <ZapOff className="text-red-500" size={20} />
                            <h3 className="font-bold text-zinc-100">Peak Shaving Alerts</h3>
                        </div>
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">WARNING</span>
                    </div>
                    <div className="divide-y divide-zinc-800">
                        {opt.peakShavingAlerts.map((item, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-850 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-200">{item.time}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                            <ArrowRight size={10} className="text-red-500" /> High-Cost Demand
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-red-400">₹{item.price.toFixed(2)}</p>
                                    <p className="text-[10px] text-zinc-600">per kWh</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};