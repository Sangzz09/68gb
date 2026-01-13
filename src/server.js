// server.js - Expert AI Tài Xỉu v3.0 - Full Code
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const TIMEOUT = 15000;
const FIREBASE_URL = 'https://gbmd5-4a69a-default-rtdb.asia-southeast1.firebasedatabase.app/taixiu_sessions.json';

// =============== FETCH DATA ===============
async function fetchData(maxRetries = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Lần thử ${attempt}/${maxRetries}...`);
      const config = {
        timeout: TIMEOUT,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };
      const response = await axios.get(`${FIREBASE_URL}?t=${Date.now()}`, config);
      if (response.data && Object.keys(response.data).length > 0) {
        console.log(`✅ Thành công! Số phiên: ${Object.keys(response.data).length}`);
        // Log mẫu dữ liệu đầu tiên để debug
        const firstKey = Object.keys(response.data)[0];
        console.log(`🔍 Mẫu dữ liệu:`, JSON.stringify(response.data[firstKey]));
        return { success: true, data: response.data };
      }
    } catch (error) {
      lastError = error;
      console.log(`❌ Lỗi: ${error.message}`);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }
  return { success: false, error: lastError?.message };
}

// =============== ANALYZER CLASS ===============
class TaiXiuExpertAnalyzerV3 {
  constructor() {
    this.qTable = {};
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.dynamicWeights = {
      fibonacci: 0.06, goldenRatio: 0.09, waveTheory: 0.08,
      probabilityMatrix: 0.08, neuralPattern: 0.12, momentumShift: 0.10,
      entropy: 0.07, deepLearning: 0.12, harmonicResonance: 0.08,
      chaosTheory: 0.05, bayesianNetwork: 0.07, monteCarlo: 0.08,
      reinforcementLearning: 0.15,
      knn: 0.14, rsi: 0.09 // Thêm trọng số cho thuật toán mới
    };
    this.lastSessionId = null;
    this.cachedAnalysis = null;
  }

  calculateTotal(dices) {
    if (!Array.isArray(dices) || dices.length === 0) return 0;
    return dices.reduce((sum, dice) => sum + dice, 0);
  }

  getTaiXiu(total) {
    return total >= 11 ? 'Tài' : 'Xỉu';
  }

  analyzeStreak(history) {
    if (history.length === 0) return { type: null, length: 0 };
    let currentStreak = 1;
    let streakType = history[history.length - 1];
    for (let i = history.length - 2; i >= 0; i--) {
      if (history[i] === streakType) currentStreak++;
      else break;
    }
    return { type: streakType, length: currentStreak };
  }

  analyzeZigzag(history) {
    if (history.length < 4) return { active: false, strength: 0 };
    const last4 = history.slice(-4);
    let zigzagCount = 0;
    for (let i = 0; i < last4.length - 1; i++) {
      if (last4[i] !== last4[i + 1]) zigzagCount++;
    }
    return { active: zigzagCount >= 3, strength: (zigzagCount / 3) * 100 };
  }

  analyzeFibonacci(sessions) {
    const fibSeq = [1, 1, 2, 3, 5, 8, 13, 21, 34];
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    let streaks = [];
    let currentStreak = 1;
    let currentType = history[0];
    for (let i = 1; i < history.length; i++) {
      if (history[i] === currentType) {
        currentStreak++;
      } else {
        streaks.push({ type: currentType, length: currentStreak });
        currentType = history[i];
        currentStreak = 1;
      }
    }
    streaks.push({ type: currentType, length: currentStreak });
    const lastStreak = streaks[streaks.length - 1];
    const isFibNumber = fibSeq.includes(lastStreak.length);
    const nextFib = fibSeq[fibSeq.indexOf(lastStreak.length) + 1] || lastStreak.length + 1;
    let prediction = null;
    let confidence = 60;
    if (isFibNumber && lastStreak.length >= 5) {
      prediction = lastStreak.type === 'Tài' ? 'Xỉu' : 'Tài';
      confidence = 80;
    } else if (lastStreak.length === nextFib - 1) {
      prediction = lastStreak.type;
      confidence = 75;
    }
    return { isFibonacci: isFibNumber, currentStreak: lastStreak.length, streakType: lastStreak.type, nextFibTarget: nextFib, prediction, confidence };
  }

  analyzeGoldenRatio(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const last55 = history.slice(-55);
    const taiCount = last55.filter(h => h === 'Tài').length;
    const xiuCount = 55 - taiCount;
    const ratio = taiCount / xiuCount;
    const goldenRatio = 1.618;
    const inverseGolden = 0.618;
    let prediction = null;
    let confidence = 0;
    if (Math.abs(ratio - goldenRatio) < 0.1) {
      prediction = 'Xỉu';
      confidence = 85;
    } else if (Math.abs(ratio - inverseGolden) < 0.1) {
      prediction = 'Tài';
      confidence = 85;
    } else if (ratio > 1.5) {
      prediction = 'Xỉu';
      confidence = 75;
    } else if (ratio < 0.66) {
      prediction = 'Tài';
      confidence = 75;
    }
    return { ratio: ratio.toFixed(3), taiCount, xiuCount, prediction, confidence, isGoldenRatio: Math.abs(ratio - goldenRatio) < 0.1 || Math.abs(ratio - inverseGolden) < 0.1 };
  }

  analyzeWavePattern(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const last21 = history.slice(-21);
    let waves = [];
    let currentWave = { type: last21[0], length: 1 };
    for (let i = 1; i < last21.length; i++) {
      if (last21[i] === currentWave.type) {
        currentWave.length++;
      } else {
        waves.push(currentWave);
        currentWave = { type: last21[i], length: 1 };
      }
    }
    waves.push(currentWave);
    const waveCount = waves.length;
    const avgWaveLength = waves.reduce((sum, w) => sum + w.length, 0) / waves.length;
    const isImpulseWave = waveCount >= 5 && avgWaveLength >= 2;
    const isCorrectionPhase = waveCount >= 8;
    let prediction = null;
    let confidence = 65;
    if (isCorrectionPhase) {
      prediction = waves[waves.length - 1].type === 'Tài' ? 'Xỉu' : 'Tài';
      confidence = 78;
    } else if (isImpulseWave) {
      prediction = waves[waves.length - 1].type;
      confidence = 72;
    }
    return { waveCount, avgWaveLength: avgWaveLength.toFixed(1), currentPhase: isCorrectionPhase ? 'Correction' : isImpulseWave ? 'Impulse' : 'Formation', waves: waves.slice(-5), prediction, confidence };
  }

  buildProbabilityMatrix(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const matrix = { 'TT': 0, 'TX': 0, 'XT': 0, 'XX': 0 };
    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i][0];
      const next = history[i + 1][0];
      const key = current + next;
      matrix[key]++;
    }
    const last = history[history.length - 1][0];
    const ttProb = matrix['TT'] / (matrix['TT'] + matrix['TX']) || 0.5;
    const txProb = matrix['TX'] / (matrix['TT'] + matrix['TX']) || 0.5;
    const xtProb = matrix['XT'] / (matrix['XT'] + matrix['XX']) || 0.5;
    const xxProb = matrix['XX'] / (matrix['XT'] + matrix['XX']) || 0.5;
    let prediction = null;
    let confidence = 0;
    if (last === 'T') {
      prediction = ttProb > txProb ? 'Tài' : 'Xỉu';
      confidence = Math.max(ttProb, txProb) * 100;
    } else {
      prediction = xtProb > xxProb ? 'Tài' : 'Xỉu';
      confidence = Math.max(xtProb, xxProb) * 100;
    }
    return { matrix, probabilities: { 'T→T': (ttProb * 100).toFixed(1) + '%', 'T→X': (txProb * 100).toFixed(1) + '%', 'X→T': (xtProb * 100).toFixed(1) + '%', 'X→X': (xxProb * 100).toFixed(1) + '%' }, prediction, confidence: Math.round(confidence) };
  }

  analyzeNeuralPattern(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    for (let len = 5; len >= 3; len--) {
      const patterns = {};
      for (let i = 0; i < history.length - len; i++) {
        const pattern = history.slice(i, i + len).map(h => h[0]).join('');
        const nextResult = history[i + len][0];
        if (!patterns[pattern]) patterns[pattern] = { T: 0, X: 0, total: 0 };
        patterns[pattern][nextResult]++;
        patterns[pattern].total++;
      }
      const currentPattern = history.slice(-len).map(h => h[0]).join('');
      const patternData = patterns[currentPattern];
      if (patternData && patternData.total >= 3) {
        const tProb = patternData.T / patternData.total;
        const xProb = patternData.X / patternData.total;
        return { pattern: currentPattern, length: len, historicalData: { T: patternData.T, X: patternData.X }, prediction: tProb > xProb ? 'Tài' : 'Xỉu', confidence: Math.round(Math.max(tProb, xProb) * 100), learningDepth: patternData.total };
      }
    }
    return { pattern: 'None', prediction: null, confidence: 50, learningDepth: 0 };
  }

  analyzeMomentumShift(sessions) {
    const totals = sessions.map(s => this.calculateTotal(s.dices));
    const last13 = totals.slice(-13);
    let momentum = 0;
    let accelerations = [];
    for (let i = 1; i < last13.length; i++) {
      const change = last13[i] - last13[i - 1];
      momentum += change;
      if (i > 1) accelerations.push(change - (last13[i - 1] - last13[i - 2]));
    }
    const avgMomentum = momentum / (last13.length - 1);
    const avgAcceleration = accelerations.reduce((a, b) => a + b, 0) / accelerations.length;
    const lastTotal = totals[totals.length - 1];
    const predictedTotal = lastTotal + avgMomentum + (avgAcceleration * 0.5);
    const isReversal = Math.abs(avgMomentum) > 2.5;
    const isAccelerating = Math.abs(avgAcceleration) > 1;
    const trendStrength = Math.min(Math.abs(avgMomentum) * 12, 100);
    let confidence = 70;
    if (isReversal && isAccelerating) confidence = 88;
    else if (isReversal) confidence = 82;
    else if (isAccelerating) confidence = 76;
    return { momentum: avgMomentum.toFixed(2), acceleration: avgAcceleration.toFixed(2), currentTotal: lastTotal, predictedTotal: Math.round(predictedTotal), prediction: predictedTotal >= 10.5 ? 'Tài' : 'Xỉu', isReversal, isAccelerating, trendStrength: Math.round(trendStrength), confidence };
  }

  analyzeEntropy(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const last34 = history.slice(-34);
    let changes = 0;
    let segments = [];
    let currentSegment = 1;
    for (let i = 1; i < last34.length; i++) {
      if (last34[i] !== last34[i - 1]) {
        changes++;
        segments.push(currentSegment);
        currentSegment = 1;
      } else {
        currentSegment++;
      }
    }
    segments.push(currentSegment);
    const entropy = changes / (last34.length - 1);
    const avgSegmentLength = segments.reduce((a, b) => a + b, 0) / segments.length;
    const isHighEntropy = entropy > 0.65;
    const isLowEntropy = entropy < 0.35;
    let prediction = null;
    let confidence = 0;
    if (isLowEntropy) {
      prediction = last34[last34.length - 1];
      confidence = 78;
    } else if (isHighEntropy) {
      prediction = last34[last34.length - 1] === 'Tài' ? 'Xỉu' : 'Tài';
      confidence = 74;
    } else {
      const recentChanges = last34.slice(-5).filter((v, i, arr) => i > 0 && v !== arr[i - 1]).length;
      if (recentChanges >= 3) {
        prediction = last34[last34.length - 1] === 'Tài' ? 'Xỉu' : 'Tài';
        confidence = 68;
      }
    }
    return { entropy: entropy.toFixed(3), entropyLevel: isHighEntropy ? 'High' : isLowEntropy ? 'Low' : 'Medium', changeRate: (entropy * 100).toFixed(1) + '%', avgSegmentLength: avgSegmentLength.toFixed(1), prediction, confidence, stability: ((1 - entropy) * 100).toFixed(1) + '%' };
  }

  // =============== VIP ALGORITHMS ===============
  
  // 1. K-Nearest Neighbors (KNN) - Tìm mẫu hình tương đồng trong quá khứ
  analyzeKNN(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const k = 5; // Số lượng hàng xóm gần nhất
    const patternLength = 7; // Độ dài chuỗi cần so sánh
    
    if (history.length < patternLength + 1) return { prediction: null, confidence: 50 };

    const currentPattern = history.slice(-patternLength).join('');
    let matches = [];

    // Quét toàn bộ lịch sử
    for (let i = 0; i < history.length - patternLength - 1; i++) {
      const slice = history.slice(i, i + patternLength).join('');
      // Tính độ tương đồng (Hamming distance đơn giản hóa)
      if (slice === currentPattern) {
        matches.push(history[i + patternLength]);
      }
    }

    if (matches.length === 0) return { prediction: null, confidence: 50, matchCount: 0 };

    const taiCount = matches.filter(m => m === 'Tài').length;
    const xiuCount = matches.length - taiCount;
    const total = matches.length;

    const prediction = taiCount > xiuCount ? 'Tài' : 'Xỉu';
    const confidence = Math.round((Math.max(taiCount, xiuCount) / total) * 100);

    return {
      prediction,
      confidence,
      matchCount: total,
      details: `Tìm thấy ${total} mẫu tương đồng trong quá khứ`
    };
  }

  // 2. RSI (Relative Strength Index) - Chỉ số sức mạnh tương đối
  analyzeRSI(sessions) {
    const totals = sessions.map(s => this.calculateTotal(s.dices));
    const period = 14;
    if (totals.length < period + 1) return { rsi: 50, prediction: null };

    let gains = 0;
    let losses = 0;

    for (let i = totals.length - period; i < totals.length; i++) {
      const change = totals[i] - totals[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return { rsi: 100, prediction: 'Xỉu', confidence: 85 }; // Quá mua -> Đánh Xỉu
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    let prediction = null;
    let confidence = 50;

    // RSI > 70: Quá mua (Overbought) -> Xu hướng đảo chiều về Xỉu
    // RSI < 30: Quá bán (Oversold) -> Xu hướng đảo chiều về Tài
    if (rsi > 70) {
      prediction = 'Xỉu';
      confidence = 75 + (rsi - 70);
    } else if (rsi < 30) {
      prediction = 'Tài';
      confidence = 75 + (30 - rsi);
    }

    return { rsi: rsi.toFixed(2), prediction, confidence: Math.min(Math.round(confidence), 95) };
  }

  deepLearningAnalysis(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const totals = sessions.map(s => this.calculateTotal(s.dices));
    const deepPatterns = {};
    for (let i = 0; i < history.length - 4; i++) {
      const pattern = history.slice(i, i + 4).map(h => h[0]).join('');
      const nextResult = history[i + 4][0];
      const totalSum = totals.slice(i, i + 4).reduce((a, b) => a + b, 0);
      if (!deepPatterns[pattern]) deepPatterns[pattern] = { T: 0, X: 0, totals: [] };
      deepPatterns[pattern][nextResult]++;
      deepPatterns[pattern].totals.push(totalSum);
    }
    const currentPattern = history.slice(-4).map(h => h[0]).join('');
    const patternData = deepPatterns[currentPattern];
    if (patternData && (patternData.T + patternData.X) >= 2) {
      const total = patternData.T + patternData.X;
      const tProb = patternData.T / total;
      const avgTotal = patternData.totals.reduce((a, b) => a + b, 0) / patternData.totals.length;
      return { pattern: currentPattern, prediction: tProb > 0.5 ? 'Tài' : 'Xỉu', confidence: Math.round(Math.max(tProb, 1 - tProb) * 100), depth: total, avgHistoricalTotal: avgTotal.toFixed(1) };
    }
    return { pattern: currentPattern, prediction: null, confidence: 50, depth: 0 };
  }

  harmonicResonance(sessions) {
    const totals = sessions.map(s => this.calculateTotal(s.dices));
    const last21 = totals.slice(-21);
    const harmonics = [3, 5, 8, 13, 21];
    let resonanceScore = 0;
    for (let h of harmonics) {
      if (last21.length >= h) {
        const segment = last21.slice(-h);
        const avg = segment.reduce((a, b) => a + b, 0) / h;
        const variance = segment.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / h;
        if (variance < 3) resonanceScore += 20;
        else if (variance < 5) resonanceScore += 10;
      }
    }
    const isHighResonance = resonanceScore >= 50;
    let prediction = null;
    let confidence = 65;
    if (isHighResonance) {
      const recentAvg = last21.slice(-8).reduce((a, b) => a + b, 0) / 8;
      prediction = recentAvg >= 10.5 ? 'Tài' : 'Xỉu';
      confidence = 80;
    }
    return { resonanceScore, isHighResonance, prediction, confidence, harmonicLevel: isHighResonance ? 'Strong' : resonanceScore >= 30 ? 'Medium' : 'Weak' };
  }

  chaosTheoryAnalysis(sessions) {
    const totals = sessions.map(s => this.calculateTotal(s.dices));
    const last21 = totals.slice(-21);
    let divergence = 0;
    for (let i = 1; i < last21.length; i++) {
      const diff = Math.abs(last21[i] - last21[i - 1]);
      divergence += diff;
    }
    const avgDivergence = divergence / (last21.length - 1);
    const isChaotic = avgDivergence > 2.5;
    const isStable = avgDivergence < 1.5;
    let prediction = null;
    let confidence = 60;
    if (isStable) {
      const recentTrend = last21.slice(-5);
      const trendSum = recentTrend.reduce((a, b) => a + b, 0);
      prediction = trendSum / 5 >= 10.5 ? 'Tài' : 'Xỉu';
      confidence = 75;
    } else if (isChaotic) {
      const lastResult = this.getTaiXiu(totals[totals.length - 1]);
      prediction = lastResult === 'Tài' ? 'Xỉu' : 'Tài';
      confidence = 70;
    }
    return { divergence: avgDivergence.toFixed(2), systemState: isChaotic ? 'Chaotic' : isStable ? 'Stable' : 'Transitional', prediction, confidence };
  }

  bayesianNetwork(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const taiCount = history.filter(h => h === 'Tài').length;
    const priorTai = taiCount / history.length;
    const priorXiu = 1 - priorTai;
    const recent = history.slice(-8);
    const recentTai = recent.filter(h => h === 'Tài').length;
    const recentXiu = 8 - recentTai;
    const likelihoodTai = recentTai / 8;
    const likelihoodXiu = recentXiu / 8;
    const posteriorTai = (likelihoodTai * priorTai) / ((likelihoodTai * priorTai) + (likelihoodXiu * priorXiu));
    const posteriorXiu = 1 - posteriorTai;
    const prediction = posteriorTai > posteriorXiu ? 'Tài' : 'Xỉu';
    const confidence = Math.round(Math.max(posteriorTai, posteriorXiu) * 100);
    return { priorTai: (priorTai * 100).toFixed(1) + '%', priorXiu: (priorXiu * 100).toFixed(1) + '%', posteriorTai: (posteriorTai * 100).toFixed(1) + '%', posteriorXiu: (posteriorXiu * 100).toFixed(1) + '%', prediction, confidence };
  }

  monteCarloSimulation(sessions) {
    const totals = sessions.map(s => this.calculateTotal(s.dices));
    const last50 = totals.slice(-50);
    const mean = last50.reduce((a, b) => a + b, 0) / last50.length;
    const variance = last50.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / last50.length;
    const stdDev = Math.sqrt(variance);
    let taiCount = 0;
    let xiuCount = 0;
    const simulations = 2000;
    for (let i = 0; i < simulations; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const simulatedValue = mean + z * stdDev;
      if (simulatedValue >= 10.5) taiCount++;
      else xiuCount++;
    }
    const taiProb = taiCount / simulations;
    const xiuProb = xiuCount / simulations;
    return { mean: mean.toFixed(2), stdDev: stdDev.toFixed(2), prediction: taiProb > xiuProb ? 'Tài' : 'Xỉu', confidence: Math.round(Math.max(taiProb, xiuProb) * 100) };
  }

  reinforcementLearning(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    for (let i = 3; i < history.length - 1; i++) {
      const state = history.slice(i-3, i).join('');
      const action = history[i];
      const nextState = history.slice(i-2, i+1).join('');
      if (!this.qTable[state]) this.qTable[state] = { 'Tài': 0, 'Xỉu': 0 };
      if (!this.qTable[nextState]) this.qTable[nextState] = { 'Tài': 0, 'Xỉu': 0 };
      const reward = 1;
      const currentQ = this.qTable[state][action];
      const maxNextQ = Math.max(this.qTable[nextState]['Tài'], this.qTable[nextState]['Xỉu']);
      this.qTable[state][action] = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
    }
    const currentState = history.slice(-3).join('');
    if (!this.qTable[currentState]) {
      return { prediction: null, confidence: 50, qValues: {} };
    }
    const qTai = this.qTable[currentState]['Tài'];
    const qXiu = this.qTable[currentState]['Xỉu'];
    const totalQ = Math.abs(qTai) + Math.abs(qXiu);
    const confidence = totalQ === 0 ? 50 : Math.round((Math.max(qTai, qXiu) / totalQ) * 100);
    return { prediction: qTai > qXiu ? 'Tài' : 'Xỉu', confidence: Math.min(confidence + 20, 95), qValues: { Tai: qTai.toFixed(4), Xiu: qXiu.toFixed(4) }, state: currentState };
  }

  adaptiveWeightTuning(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const lastStreak = this.analyzeStreak(history);
    if (lastStreak.length >= 4) {
      this.dynamicWeights.momentumShift += 0.05;
      this.dynamicWeights.neuralPattern += 0.05;
      this.dynamicWeights.chaosTheory -= 0.05;
    } else {
      this.dynamicWeights.momentumShift = 0.10;
      this.dynamicWeights.neuralPattern = 0.12;
    }
  }

  // =============== REALISTIC BRIDGE DETECTION (CẦU THỰC TẾ) ===============
  detectSpecialBridges(history) {
    const bridges = [];
    const len = history.length;
    if (len < 10) return bridges;

    const last10 = history.slice(-10).map(h => h === 'Tài' ? 'T' : 'X').join('');
    
    // 1. Cầu 1-1 (Ping Pong): TXTX...
    if (last10.endsWith('TXTX') || last10.endsWith('XTXT')) {
      bridges.push('Cầu 1-1 (Ping Pong)');
    }

    // 2. Cầu 2-2: TTXXTT...
    if (last10.endsWith('TTXX') || last10.endsWith('XXTT')) {
      bridges.push('Cầu 2-2');
    }

    // 3. Cầu 1-2-3 (Stairs): T-XX-TTT hoặc ngược lại
    if (/(?:TXXTTT|XTTXXX)$/.test(last10)) {
      bridges.push('Cầu 1-2-3 (Cầu Thang)');
    }

    // 4. Cầu 3-2-1: TTT-XX-T hoặc ngược lại
    if (/(?:TTTXXT|XXXTTX)$/.test(last10)) {
      bridges.push('Cầu 3-2-1 (Cầu Thang Ngược)');
    }

    // 5. Cầu Nghiêng (Bias): 1 bên chiếm ưu thế > 70% trong 20 phiên gần nhất
    const last20 = history.slice(-20);
    const taiCount = last20.filter(h => h === 'Tài').length;
    if (taiCount >= 14) bridges.push('Cầu Nghiêng Tài');
    else if (taiCount <= 6) bridges.push('Cầu Nghiêng Xỉu');

    return bridges;
  }

  quantumPredictV3(sessions) {
    this.adaptiveWeightTuning(sessions);
    const weights = this.dynamicWeights;
    const fib = this.analyzeFibonacci(sessions);
    const golden = this.analyzeGoldenRatio(sessions);
    const wave = this.analyzeWavePattern(sessions);
    const matrix = this.buildProbabilityMatrix(sessions);
    const neural = this.analyzeNeuralPattern(sessions);
    const momentum = this.analyzeMomentumShift(sessions);
    const entropy = this.analyzeEntropy(sessions);
    const deepLearning = this.deepLearningAnalysis(sessions);
    const harmonic = this.harmonicResonance(sessions);
    const chaos = this.chaosTheoryAnalysis(sessions);
    const bayesian = this.bayesianNetwork(sessions);
    const monte = this.monteCarloSimulation(sessions);
    const rl = this.reinforcementLearning(sessions);
    const knn = this.analyzeKNN(sessions);
    const rsi = this.analyzeRSI(sessions);
    
    let taiScore = 0;
    let xiuScore = 0;
    const algorithms = [
      { name: 'fibonacci', data: fib, weight: weights.fibonacci },
      { name: 'goldenRatio', data: golden, weight: weights.goldenRatio },
      { name: 'waveTheory', data: wave, weight: weights.waveTheory },
      { name: 'probabilityMatrix', data: matrix, weight: weights.probabilityMatrix },
      { name: 'neuralPattern', data: neural, weight: weights.neuralPattern },
      { name: 'momentumShift', data: momentum, weight: weights.momentumShift },
      { name: 'entropy', data: entropy, weight: weights.entropy },
      { name: 'deepLearning', data: deepLearning, weight: weights.deepLearning },
      { name: 'harmonicResonance', data: harmonic, weight: weights.harmonicResonance },
      { name: 'chaosTheory', data: chaos, weight: weights.chaosTheory },
      { name: 'bayesianNetwork', data: bayesian, weight: weights.bayesianNetwork },
      { name: 'monteCarlo', data: monte, weight: weights.monteCarlo },
      { name: 'reinforcementLearning', data: rl, weight: weights.reinforcementLearning },
      { name: 'knn', data: knn, weight: weights.knn },
      { name: 'rsi', data: rsi, weight: weights.rsi }
    ];
    
    for (let algo of algorithms) {
      if (algo.data.prediction === 'Tài') {
        taiScore += algo.weight * (algo.data.confidence / 100);
      } else if (algo.data.prediction === 'Xỉu') {
        xiuScore += algo.weight * (algo.data.confidence / 100);
      }
    }
    
    const finalPrediction = taiScore > xiuScore ? 'Tài' : 'Xỉu';
    const finalConfidence = Math.round(Math.max(taiScore, xiuScore) * 100);
    
    return {
      prediction: finalPrediction,
      confidence: Math.min(finalConfidence, 99),
      taiScore: (taiScore * 100).toFixed(1) + '%',
      xiuScore: (xiuScore * 100).toFixed(1) + '%',
      algorithms: { fibonacci: fib, goldenRatio: golden, waveTheory: wave, probabilityMatrix: matrix, neuralPattern: neural, momentumShift: momentum, entropy: entropy, deepLearning: deepLearning, harmonicResonance: harmonic, chaosTheory: chaos, bayesianNetwork: bayesian, monteCarlo: monte, reinforcementLearning: rl, knn: knn, rsi: rsi }
    };
  }

  getExpertReasoning(quantum, streak) {
    const topAlgos = Object.entries(quantum.algorithms)
      .map(([name, data]) => ({ name, ...data }))
      .filter(a => a.prediction === quantum.prediction)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map(a => a.name);

    let reason = `AI Chuyên Gia dự đoán ${quantum.prediction} (Tỉ lệ ${quantum.confidence}%) dựa trên tín hiệu từ: ${topAlgos.join(', ')}.`;
    if (streak.length >= 4) reason += ` Cảnh báo cầu bệt ${streak.type} dài ${streak.length} phiên.`;
    return reason;
  }

  expertAnalysisV3(sessions, sessionId) {
    // Tạm tắt cache để đảm bảo luôn phân tích lại khi debug
    // if (sessionId && this.lastSessionId === sessionId && this.cachedAnalysis) {
    //   return this.cachedAnalysis;
    // }
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const quantum = this.quantumPredictV3(sessions);
    const streak = this.analyzeStreak(history);
    const specialBridges = this.detectSpecialBridges(history);
    const reasoning = this.getExpertReasoning(quantum, streak);
    
    let loaiCau = [];
    // Thêm các loại cầu đặc biệt vừa phát hiện
    loaiCau.push(...specialBridges);

    if (streak.length >= 4) loaiCau.push(`Cầu Bệt ${streak.type} (${streak.length})`);
    
    if (quantum.algorithms.neuralPattern.confidence > 80) {
      loaiCau.push('Cầu Pattern AI');
    }
    
    if (quantum.algorithms.harmonicResonance.isHighResonance) {
      loaiCau.push('Cầu Cộng Hưởng Harmonic');
    }
    
    if (quantum.algorithms.monteCarlo.confidence >= 80) {
      loaiCau.push('Cầu Xác Suất Monte Carlo');
    }
    
    if (quantum.algorithms.reinforcementLearning.confidence >= 85) {
      loaiCau.push('AI Q-Learning (Tự Học)');
    }

    if (quantum.algorithms.knn.confidence >= 80) {
      loaiCau.push(`KNN (Khớp ${quantum.algorithms.knn.matchCount} mẫu)`);
    }

    const result = {
      prediction: quantum.prediction,
      confidence: quantum.confidence,
      taiScore: quantum.taiScore,
      xiuScore: quantum.xiuScore,
      loaiCau: loaiCau,
      details: quantum.algorithms,
      reasoning: reasoning
    };
    
    this.lastSessionId = sessionId;
    this.cachedAnalysis = result;
    return result;
  }
}

// =============== API ROUTES ===============
const analyzer = new TaiXiuExpertAnalyzerV3();

app.get('/api/analyze', async (req, res) => {
  const result = await fetchData();
  
  if (!result.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Không thể kết nối đến máy chủ dữ liệu',
      error: result.error 
    });
  }

  try {
    const entries = Object.entries(result.data);
    const validEntries = entries.filter(([key, value]) => value && Array.isArray(value.dices));
    
    if (validEntries.length === 0) throw new Error("Không có dữ liệu hợp lệ");

    const [lastKey, lastSession] = validEntries[validEntries.length - 1];
    const recentSessions = validEntries.slice(-100).map(([k, v]) => v);
    
    const analysis = analyzer.expertAnalysisV3(recentSessions, lastKey);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      lastSession: lastSession,
      analysis: analysis
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi phân tích', error: error.message });
  }
});

app.get('/68gblon', async (req, res) => {
  const result = await fetchData();
  
  if (!result.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Không thể kết nối đến máy chủ dữ liệu',
      error: result.error 
    });
  }

  try {
    const entries = Object.entries(result.data);
    const validEntries = entries.filter(([key, value]) => value && Array.isArray(value.dices));
    
    if (validEntries.length === 0) {
      // Fallback: Hiển thị dữ liệu gốc để debug nếu không tìm thấy dices
      const debugData = {};
      entries.slice(-20).forEach(([k, v]) => debugData[k] = v);
      return res.json({ 
        message: "Không tìm thấy trường 'dices[]' hợp lệ. Đây là dữ liệu gốc nhận được:", 
        sample_data: debugData 
      });
    }

    const [lastKey, lastSession] = validEntries[validEntries.length - 1];
    const recentSessions = validEntries.slice(-100).map(([k, v]) => v);
    
    const analysis = analyzer.expertAnalysisV3(recentSessions, lastKey);
    
    // Chỉ lấy 50 phiên gần nhất cho json_api để tránh quá tải
    const jsonApiData = {};
    validEntries.slice(-50).forEach(([k, v]) => jsonApiData[k] = v);

    res.json({
      "json_api": jsonApiData,
      "phien": lastKey,
      "ket_qua_xuc_xac": lastSession.dices,
      "phien_hien_tai": lastSession,
      "du_doan": analysis.prediction,
      "pattern": analysis.details.neuralPattern.pattern,
      "loai_cau": analysis.loaiCau,
      "al_chuyen_gia": analysis.reasoning,
      "id": "@sewdangcap"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi phân tích', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});
