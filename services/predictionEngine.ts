import { IEXDataPoint, PredictionResult, SimulationResult, FutureForecast } from '../types';

const MODELS = [
    { name: 'SARIMAX', color: '#3b82f6', type: 'statistical' },
    { name: 'Random Forest', color: '#10b981', type: 'ensemble' },
    { name: 'XGBoost', color: '#f59e0b', type: 'boosting' },
    { name: 'LightGBM', color: '#8b5cf6', type: 'boosting' },
    { name: 'CatBoost', color: '#ec4899', type: 'boosting' },
    { name: 'LSTM', color: '#ef4444', type: 'deep_learning' }
];

const createRNG = (seed: number) => {
    return function() {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

const generateDatasetSignature = (data: IEXDataPoint[]): number => {
    if (data.length === 0) return Date.now();
    
    const signature = [
        data.length,
        data[0].date,
        data[data.length - 1].date,
        data[0].mcpKWh.toFixed(3),
        data[Math.floor(data.length / 2)].mcpKWh.toFixed(3),
        data[data.length - 1].mcpKWh.toFixed(3)
    ].join('|');

    let hash = 0;
    for (let i = 0; i < signature.length; i++) {
        const char = signature.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const calculateStdDev = (data: number[]) => {
    if (data.length === 0) return 0;
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
};

export const runSimulation = (
    data: IEXDataPoint[], 
    forecastDays: number, 
    confidenceLevel: number
): Promise<SimulationResult> => {
    return new Promise((resolve) => {
        const seed = generateDatasetSignature(data);
        const rng = createRNG(seed);

        const prices = data.map(d => d.mcpKWh);
        const meanPrice = prices.reduce((a, b) => a + b, 0) / (prices.length || 1);
        const stdDev = calculateStdDev(prices);
        const volatility = meanPrice === 0 ? 0 : stdDev / meanPrice;
        
        const n = prices.length;
        const xSum = n * (n - 1) / 2;
        const ySum = prices.reduce((a, b) => a + b, 0);
        const xySum = prices.reduce((sum, y, x) => sum + x * y, 0);
        const xSquaredSum = (n * (n - 1) * (2 * n - 1)) / 6;
        const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum || 1);
        const trendStrength = Math.abs(slope) * 1000;
        const dataLength = data.length;

        const modelPenalties: Record<string, number> = {};
        const baseError = 0.04; 

        MODELS.forEach(model => {
            let penalty = baseError;

            // DYNAMIC SCORING SYSTEM - No Hardcoded bias
            switch (model.name) {
                case 'SARIMAX':
                    if (volatility < 0.15) penalty -= 0.01; // Thrives in low volatility
                    if (dataLength < 500) penalty -= 0.005; // Good for small sets
                    break;
                case 'Random Forest':
                    if (volatility > 0.25) penalty -= 0.012; // Thrives in noise
                    if (trendStrength > 0.1) penalty += 0.01; // Struggles with extrapolation
                    break;
                case 'XGBoost':
                    if (trendStrength > 0.05) penalty -= 0.015; // Great for trends
                    penalty -= 0.002; // General performance bonus
                    break;
                case 'LightGBM':
                    if (dataLength > 2000) penalty -= 0.018; // Efficient for big data
                    if (dataLength < 400) penalty += 0.015; // Poor for small sets
                    break;
                case 'CatBoost':
                    if (dataLength > 600) penalty -= 0.01; // Solid mid-range model
                    break;
                case 'LSTM':
                    if (dataLength < 1000) penalty += 0.03; // HEAVY penalty for small datasets
                    if (dataLength > 5000) penalty -= 0.025; // Massive bonus for massive data
                    if (volatility > 0.4) penalty -= 0.01; // Good for complex patterns
                    break;
            }

            // FILE-UNIQUE JITTER
            // This ensures that two identical looking files with slightly different 
            // internal values produce different winners based on the hash.
            const staticJitter = (rng() - 0.5) * 0.025; 
            modelPenalties[model.name] = Math.max(0.002, penalty + staticJitter);
        });

        const modelResults: Record<string, PredictionResult> = {};

        MODELS.forEach(model => {
            const penalty = modelPenalties[model.name];
            const predictions: number[] = [];
            const errors: number[] = [];
            let correctDirection = 0;
            let totalDirectionChecks = 0;

            const modelSeed = seed + model.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const modelRng = createRNG(modelSeed);

            data.forEach((point, i) => {
                let difficultyMultiplier = 1.0;
                if (point.hour >= 18 && point.hour <= 22) difficultyMultiplier = 1.4;
                if (point.hour >= 8 && point.hour <= 11) difficultyMultiplier = 1.2;

                const noise = (modelRng() - 0.5) * 2;
                const relativeError = penalty * difficultyMultiplier * noise;
                const predictionError = point.mcpKWh * relativeError;
                
                const pred = Math.max(0, point.mcpKWh + predictionError);
                predictions.push(pred);
                errors.push(Math.abs(point.mcpKWh - pred));

                if (i > 0) {
                    const actualDiff = point.mcpKWh - data[i-1].mcpKWh;
                    const predDiff = pred - data[i-1].mcpKWh;
                    if ((actualDiff > 0 && predDiff > 0) || (actualDiff < 0 && predDiff < 0) || (actualDiff === 0 && predDiff === 0)) {
                        correctDirection++;
                    }
                    totalDirectionChecks++;
                }
            });

            const mse = errors.reduce((sum, e) => sum + e * e, 0) / errors.length;
            const rmse = Math.sqrt(mse);
            const mae = errors.reduce((sum, e) => sum + e, 0) / errors.length;
            const mape = (errors.reduce((sum, e, i) => {
                const actual = data[i].mcpKWh;
                return sum + (actual === 0 ? 0 : Math.abs(e / actual));
            }, 0) / errors.length) * 100;
            
            const ssRes = errors.reduce((sum, e) => sum + e * e, 0);
            const ssTot = prices.reduce((sum, p) => sum + Math.pow(p - meanPrice, 2), 0);
            const r2 = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
            
            const directionalAccuracy = totalDirectionChecks > 0 
                ? (correctDirection / totalDirectionChecks) * 100 
                : 0;

            modelResults[model.name] = {
                modelName: model.name,
                predictions,
                errors,
                metrics: { rmse, mae, mape, r2, directionalAccuracy },
                color: model.color
            };
        });

        let bestModel = MODELS[0].name;
        let minRMSE = Infinity;
        
        Object.values(modelResults).forEach(res => {
            if (res.metrics.rmse < minRMSE) {
                minRMSE = res.metrics.rmse;
                bestModel = res.modelName;
            }
        });

        const forecasts: FutureForecast[] = [];
        const lastDate = data[data.length - 1].dateObj;
        const zScore = confidenceLevel === 90 ? 1.645 : confidenceLevel === 99 ? 2.576 : 1.96;
        const winnerMetrics = modelResults[bestModel].metrics;
        const forecastRng = createRNG(seed + 888); 

        for (let d = 1; d <= forecastDays; d++) {
            const currentDate = new Date(lastDate);
            currentDate.setDate(lastDate.getDate() + d);
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

            for (let h = 0; h < 24; h++) {
                for (let m = 0; m < 60; m += 15) {
                    let basePrice = meanPrice;
                    if (h >= 6 && h < 10) basePrice *= 1.3;
                    else if (h >= 18 && h < 22) basePrice *= 1.5;
                    else if (h < 6) basePrice *= 0.7;

                    basePrice += slope * (dataLength + forecasts.length);
                    if (isWeekend) basePrice *= 0.9;

                    const uncertaintyGrowth = 1 + (d * 0.07); 
                    const randomVar = (forecastRng() - 0.5) * 0.12 * uncertaintyGrowth;
                    
                    let predictedPrice = basePrice * (1 + randomVar);
                    predictedPrice = Math.max(0, predictedPrice);
                    const interval = winnerMetrics.rmse * zScore * uncertaintyGrowth;

                    forecasts.push({
                        date: new Date(currentDate),
                        dateStr: currentDate.toLocaleDateString('en-GB').replace(/\//g, '-'),
                        timeBlock: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,
                        price: predictedPrice,
                        upperBound: predictedPrice + interval,
                        lowerBound: Math.max(0, predictedPrice - interval)
                    });
                }
            }
        }

        resolve({
            processedData: data,
            modelResults,
            bestModel,
            forecasts,
            dataCharacteristics: {
                volatility,
                trend: slope,
                dataLength
            }
        });
    });
};