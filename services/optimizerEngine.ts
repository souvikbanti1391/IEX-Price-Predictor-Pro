import { FutureForecast, OptimizationStrategy } from '../types';

export const generateOptimizationStrategy = (forecasts: FutureForecast[]): OptimizationStrategy => {
    // Sort forecasts by price to find extremes
    const sorted = [...forecasts].sort((a, b) => a.price - b.price);
    
    // Top 5 cheapest hours (Procurement windows)
    const optimalBuyWindows = sorted.slice(0, 8).map(f => ({
        time: `${f.dateStr} ${f.timeBlock}`,
        price: f.price
    }));

    // Top 5 most expensive hours (Peak shaving)
    const peakShavingAlerts = sorted.slice(-8).reverse().map(f => ({
        time: `${f.dateStr} ${f.timeBlock}`,
        price: f.price
    }));

    const avgPrice = forecasts.reduce((sum, f) => sum + f.price, 0) / forecasts.length;
    const minPrice = sorted[0].price;
    
    // Savings if you shift 30% of load from peak to trough
    const savingsPercent = ((avgPrice - minPrice) / avgPrice) * 30;

    // Volatility check
    const prices = forecasts.map(f => f.price);
    const mean = avgPrice;
    const stdDev = Math.sqrt(prices.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / prices.length);
    const cv = stdDev / mean;

    let risk: 'Low' | 'Moderate' | 'High' = 'Low';
    if (cv > 0.25) risk = 'High';
    else if (cv > 0.12) risk = 'Moderate';

    return {
        optimalBuyWindows,
        peakShavingAlerts,
        averageForecastedPrice: avgPrice,
        projectedSavingsPercent: Math.max(0, savingsPercent),
        volatilityRisk: risk
    };
};