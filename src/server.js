// server.js - Deploy lên Render với AI Chuyên Gia (Full Tiếng Việt)
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// =============== CẤU HÌNH PROXY ===============
const PROXY_CONFIG = {
  enabled: false, // Bật/tắt proxy
  proxies: [
    // Thêm proxy của bạn vào đây
    // 'http://proxy1.example.com:8080',
    // 'http://proxy2.example.com:3128',
  ],
  currentIndex: 0,
  timeout: 15000
};

const FIREBASE_URL = 'https://gbmd5-4a69a-default-rtdb.asia-southeast1.firebasedatabase.app/taixiu_sessions.json';

// =============== HÀM LẤY PROXY ===============
function getNextProxy() {
  if (!PROXY_CONFIG.enabled || PROXY_CONFIG.proxies.length === 0) {
    return null;
  }
  const proxy = PROXY_CONFIG.proxies[PROXY_CONFIG.currentIndex];
  PROXY_CONFIG.currentIndex = (PROXY_CONFIG.currentIndex + 1) % PROXY_CONFIG.proxies.length;
  return proxy;
}

// =============== HÀM LẤY DỮ LIỆU ===============
async function fetchData(maxRetries = 3) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Lần thử ${attempt}/${maxRetries}...`);
      
      const config = {
        timeout: PROXY_CONFIG.timeout,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };
      
      if (PROXY_CONFIG.enabled && PROXY_CONFIG.proxies.length > 0) {
        const proxyUrl = getNextProxy();
        console.log(`🔗 Proxy: ${proxyUrl}`);
        config.httpsAgent = new HttpsProxyAgent(proxyUrl);
        config.httpAgent = new HttpsProxyAgent(proxyUrl);
      }
      
      const response = await axios.get(FIREBASE_URL, config);
      
      if (response.data && Object.keys(response.data).length > 0) {
        console.log(`✅ Thành công! Số phiên: ${Object.keys(response.data).length}`);
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

// =============== CHUYÊN GIA PHÂN TÍCH TÀI XỈU ===============
class TaiXiuExpertAnalyzer {
  constructor() {
    this.expertLevel = 'MASTER';
    this.algorithms = {
      basic: ['streak', 'zigzag', 'double', 'balance'],
      advanced: ['fibonacci', 'golden_ratio', 'wave_theory', 'probability_matrix'],
      expert: ['neural_pattern', 'momentum_shift', 'entropy_analysis', 'quantum_prediction']
    };
  }

  calculateTotal(dices) {
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
      if (history[i] === streakType) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return { type: streakType, length: currentStreak };
  }

  analyzeZigzag(history) {
    if (history.length < 4) return { active: false, strength: 0 };
    
    const last4 = history.slice(-4);
    let zigzagCount = 0;
    
    for (let i = 0; i < last4.length - 1; i++) {
      if (last4[i] !== last4[i + 1]) {
        zigzagCount++;
      }
    }
    
    return {
      active: zigzagCount >= 3,
      strength: (zigzagCount / 3) * 100
    };
  }

  analyzeFibonacci(sessions) {
    const fibSeq = [1, 1, 2, 3, 5, 8, 13, 21];
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    
    let taiStreaks = [];
    let xiuStreaks = [];
    let currentStreak = 1;
    let currentType = history[0];
    
    for (let i = 1; i < history.length; i++) {
      if (history[i] === currentType) {
        currentStreak++;
      } else {
        if (currentType === 'Tài') {
          taiStreaks.push(currentStreak);
        } else {
          xiuStreaks.push(currentStreak);
        }
        currentType = history[i];
        currentStreak = 1;
      }
    }
    
    const lastStreak = currentStreak;
    const isFibNumber = fibSeq.includes(lastStreak);
    
    return {
      isFibonacci: isFibNumber,
      currentStreak: lastStreak,
      nextFibTarget: fibSeq[fibSeq.indexOf(lastStreak) + 1] || lastStreak + 1,
      confidence: isFibNumber ? 78 : 60
    };
  }

  analyzeGoldenRatio(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const last34 = history.slice(-34);
    
    const taiCount = last34.filter(h => h === 'Tài').length;
    const xiuCount = 34 - taiCount;
    
    const ratio = taiCount / xiuCount;
    const goldenRatio = 1.618;
    const inverseGolden = 0.618;
    
    let prediction = null;
    let confidence = 0;
    
    if (Math.abs(ratio - goldenRatio) < 0.15) {
      prediction = 'Xỉu';
      confidence = 82;
    } else if (Math.abs(ratio - inverseGolden) < 0.15) {
      prediction = 'Tài';
      confidence = 82;
    } else if (ratio > 1.3) {
      prediction = 'Xỉu';
      confidence = 70;
    } else if (ratio < 0.7) {
      prediction = 'Tài';
      confidence = 70;
    }
    
    return {
      ratio: ratio.toFixed(3),
      taiCount,
      xiuCount,
      prediction,
      confidence,
      isGoldenRatio: Math.abs(ratio - goldenRatio) < 0.15 || Math.abs(ratio - inverseGolden) < 0.15
    };
  }

  analyzeWavePattern(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const last13 = history.slice(-13);
    
    let waves = [];
    let currentWave = { type: last13[0], length: 1 };
    
    for (let i = 1; i < last13.length; i++) {
      if (last13[i] === currentWave.type) {
        currentWave.length++;
      } else {
        waves.push(currentWave);
        currentWave = { type: last13[i], length: 1 };
      }
    }
    waves.push(currentWave);
    
    const waveCount = waves.length;
    const isImpulseWave = waveCount >= 5;
    const isCorrectionPhase = waveCount >= 8;
    
    return {
      waveCount,
      currentPhase: isCorrectionPhase ? 'Correction' : isImpulseWave ? 'Impulse' : 'Formation',
      waves: waves.slice(-5),
      prediction: isCorrectionPhase ? waves[waves.length - 1].type : null,
      confidence: isCorrectionPhase ? 76 : 65
    };
  }

  buildProbabilityMatrix(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const matrix = {
      'TT': 0, 'TX': 0, 'XT': 0, 'XX': 0
    };
    
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
    
    return {
      matrix,
      probabilities: {
        'T→T': (ttProb * 100).toFixed(1) + '%',
        'T→X': (txProb * 100).toFixed(1) + '%',
        'X→T': (xtProb * 100).toFixed(1) + '%',
        'X→X': (xxProb * 100).toFixed(1) + '%'
      },
      prediction,
      confidence: Math.round(confidence)
    };
  }

  analyzeNeuralPattern(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const patterns = {
      'TTT': 0, 'TTX': 0, 'TXT': 0, 'TXX': 0,
      'XTT': 0, 'XTX': 0, 'XXT': 0, 'XXX': 0
    };
    
    for (let i = 0; i < history.length - 3; i++) {
      const pattern = history.slice(i, i + 3).map(h => h[0]).join('');
      const nextResult = history[i + 3];
      const key = pattern;
      
      if (!patterns[key + '_next']) {
        patterns[key + '_next'] = { T: 0, X: 0 };
      }
      patterns[key + '_next'][nextResult[0]]++;
    }
    
    const currentPattern = history.slice(-3).map(h => h[0]).join('');
    const patternData = patterns[currentPattern + '_next'];
    
    if (patternData) {
      const tCount = patternData.T || 0;
      const xCount = patternData.X || 0;
      const total = tCount + xCount;
      
      return {
        pattern: currentPattern,
        historicalData: { T: tCount, X: xCount },
        prediction: tCount > xCount ? 'Tài' : 'Xỉu',
        confidence: total > 0 ? Math.round((Math.max(tCount, xCount) / total) * 100) : 65,
        learningDepth: total
      };
    }
    
    return {
      pattern: currentPattern,
      prediction: null,
      confidence: 50,
      learningDepth: 0
    };
  }

  analyzeMomentumShift(sessions) {
    const totals = sessions.map(s => this.calculateTotal(s.dices));
    const last10 = totals.slice(-10);
    
    let momentum = 0;
    for (let i = 1; i < last10.length; i++) {
      momentum += (last10[i] - last10[i - 1]);
    }
    
    const avgMomentum = momentum / (last10.length - 1);
    const lastTotal = totals[totals.length - 1];
    const predictedTotal = lastTotal + avgMomentum;
    
    const isReversal = Math.abs(avgMomentum) > 2;
    const trendStrength = Math.min(Math.abs(avgMomentum) * 10, 100);
    
    return {
      momentum: avgMomentum.toFixed(2),
      currentTotal: lastTotal,
      predictedTotal: Math.round(predictedTotal),
      prediction: predictedTotal >= 10.5 ? 'Tài' : 'Xỉu',
      isReversal,
      trendStrength: Math.round(trendStrength),
      confidence: isReversal ? 85 : 70
    };
  }

  analyzeEntropy(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const last20 = history.slice(-20);
    
    let changes = 0;
    for (let i = 1; i < last20.length; i++) {
      if (last20[i] !== last20[i - 1]) {
        changes++;
      }
    }
    
    const entropy = changes / (last20.length - 1);
    const isHighEntropy = entropy > 0.6;
    const isLowEntropy = entropy < 0.3;
    
    let prediction = null;
    let confidence = 0;
    
    if (isLowEntropy) {
      prediction = last20[last20.length - 1];
      confidence = 73;
    } else if (isHighEntropy) {
      prediction = last20[last20.length - 1] === 'Tài' ? 'Xỉu' : 'Tài';
      confidence = 71;
    }
    
    return {
      entropy: entropy.toFixed(2),
      entropyLevel: isHighEntropy ? 'High' : isLowEntropy ? 'Low' : 'Medium',
      changeRate: (entropy * 100).toFixed(1) + '%',
      prediction,
      confidence,
      stability: ((1 - entropy) * 100).toFixed(1) + '%'
    };
  }

  quantumPredict(sessions) {
    const weights = {
      fibonacci: 0.12,
      goldenRatio: 0.15,
      waveTheory: 0.13,
      probabilityMatrix: 0.15,
      neuralPattern: 0.18,
      momentumShift: 0.15,
      entropy: 0.12
    };
    
    const fib = this.analyzeFibonacci(sessions);
    const golden = this.analyzeGoldenRatio(sessions);
    const wave = this.analyzeWavePattern(sessions);
    const matrix = this.buildProbabilityMatrix(sessions);
    const neural = this.analyzeNeuralPattern(sessions);
    const momentum = this.analyzeMomentumShift(sessions);
    const entropy = this.analyzeEntropy(sessions);
    
    let taiScore = 0;
    let xiuScore = 0;
    
    if (golden.prediction === 'Tài') taiScore += weights.goldenRatio * (golden.confidence / 100);
    else if (golden.prediction === 'Xỉu') xiuScore += weights.goldenRatio * (golden.confidence / 100);
    
    if (wave.prediction === 'Tài') taiScore += weights.waveTheory * (wave.confidence / 100);
    else if (wave.prediction === 'Xỉu') xiuScore += weights.waveTheory * (wave.confidence / 100);
    
    if (matrix.prediction === 'Tài') taiScore += weights.probabilityMatrix * (matrix.confidence / 100);
    else if (matrix.prediction === 'Xỉu') xiuScore += weights.probabilityMatrix * (matrix.confidence / 100);
    
    if (neural.prediction === 'Tài') taiScore += weights.neuralPattern * (neural.confidence / 100);
    else if (neural.prediction === 'Xỉu') xiuScore += weights.neuralPattern * (neural.confidence / 100);
    
    if (momentum.prediction === 'Tài') taiScore += weights.momentumShift * (momentum.confidence / 100);
    else if (momentum.prediction === 'Xỉu') xiuScore += weights.momentumShift * (momentum.confidence / 100);
    
    if (entropy.prediction === 'Tài') taiScore += weights.entropy * (entropy.confidence / 100);
    else if (entropy.prediction === 'Xỉu') xiuScore += weights.entropy * (entropy.confidence / 100);
    
    const finalPrediction = taiScore > xiuScore ? 'Tài' : 'Xỉu';
    const finalConfidence = Math.round(Math.max(taiScore, xiuScore) * 100);
    
    return {
      prediction: finalPrediction,
      confidence: Math.min(finalConfidence, 98),
      taiScore: (taiScore * 100).toFixed(1) + '%',
      xiuScore: (xiuScore * 100).toFixed(1) + '%',
      algorithms: {
        fibonacci: fib,
        goldenRatio: golden,
        waveTheory: wave,
        probabilityMatrix: matrix,
        neuralPattern: neural,
        momentumShift: momentum,
        entropy: entropy
      }
    };
  }

  expertAnalysis(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const quantum = this.quantumPredict(sessions);
    const streak = this.analyzeStreak(history);
    const zigzag = this.analyzeZigzag(history);
    
    const loaiCau = [];
    
    if (streak.length >= 5) {
      loaiCau.push('Cầu Phá Chuỗi Dài');
    }
    
    if (zigzag.active) {
      loaiCau.push('Cầu Zigzag Dao Động');
    }
    
    if (quantum.algorithms.goldenRatio.isGoldenRatio) {
      loaiCau.push('Cầu Tỷ Lệ Vàng');
    }
    
    if (quantum.algorithms.momentumShift.isReversal) {
      loaiCau.push('Cầu Đảo Momentum');
    }
    
    if (quantum.algorithms.neuralPattern.learningDepth > 5) {
      loaiCau.push('Cầu Pattern AI');
    }
    
    return {
      prediction: quantum.prediction,
      confidence: quantum.confidence,
      pattern: quantum.algorithms.neuralPattern.pattern,
      loaiCau: loaiCau.length > 0 ? loaiCau : ['Cầu Thường']
    };
  }
}

const analyzer = new TaiXiuExpertAnalyzer();

// =============== API ENDPOINTS ===============

app.get('/api/taixiu', async (req, res) => {
  try {
    const fetchResult = await fetchData();
    
    if (!fetchResult.success) {
      return res.status(503).json({ 
        loi: 'Không thể kết nối nguồn dữ liệu'
      });
    }

    const data = fetchResult.data;
    const sessions = Object.entries(data)
      .map(([id, session]) => ({
        id,
        ...session,
        total: analyzer.calculateTotal(session.dices),
        result: analyzer.getTaiXiu(analyzer.calculateTotal(session.dices))
      }))
      .sort((a, b) => a.session_id - b.session_id);

    const currentSession = sessions[sessions.length - 1];
    const expertResult = analyzer.expertAnalysis(sessions);

    const result = {
      id: '@sewdangcap',
      phien: currentSession.session_id,
      xuc_xac: currentSession.dices,
      ket_qua: currentSession.result,
      phien_hien_tai: currentSession.session_id,
      du_doan: expertResult.prediction,
      pattern: expertResult.pattern,
      loai_cau: expertResult.loaiCau
    };

    res.json(result);
    
  } catch (error) {
    res.status(500).json({ 
      loi: 'Lỗi xử lý dữ liệu'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    trang_thai: 'OK', 
    thong_diep: 'Expert AI TàiXỉu API v2.0'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Expert TàiXỉu API chạy trên port ${PORT}`);
});
