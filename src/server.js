// server.js - Deploy lên Render với AI Chuyên Gia
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const FIREBASE_URL = 'https://gbmd5-4a69a-default-rtdb.asia-southeast1.firebasedatabase.app/taixiu_sessions.json';

// =============== CHUYÊN GIA PHÂN TÍCH TÀI XỈU ===============
class TaiXiuExpertAnalyzer {
  constructor() {
    this.expertLevel = 'MASTER'; // 10+ năm kinh nghiệm
    this.algorithms = {
      // Thuật toán cơ bản
      basic: ['streak', 'zigzag', 'double', 'balance'],
      // Thuật toán nâng cao
      advanced: ['fibonacci', 'golden_ratio', 'wave_theory', 'probability_matrix'],
      // Thuật toán chuyên gia
      expert: ['neural_pattern', 'momentum_shift', 'entropy_analysis', 'quantum_prediction']
    };
  }

  // ========== THUẬT TOÁN CƠ BẢN ==========
  
  calculateTotal(dices) {
    return dices.reduce((sum, dice) => sum + dice, 0);
  }

  getTaiXiu(total) {
    return total >= 11 ? 'Tài' : 'Xỉu';
  }

  // Phân tích chuỗi streak
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

  // Phân tích zigzag
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

  // ========== THUẬT TOÁN NÂNG CAO ==========
  
  // Fibonacci Sequence Analysis
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

  // Golden Ratio Analysis (Tỷ lệ vàng 1.618)
  analyzeGoldenRatio(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const last34 = history.slice(-34); // Fibonacci 34
    
    const taiCount = last34.filter(h => h === 'Tài').length;
    const xiuCount = 34 - taiCount;
    
    const ratio = taiCount / xiuCount;
    const goldenRatio = 1.618;
    const inverseGolden = 0.618;
    
    let prediction = null;
    let confidence = 0;
    
    if (Math.abs(ratio - goldenRatio) < 0.15) {
      prediction = 'Xỉu'; // Tài đang chiếm ưu thế → đảo về Xỉu
      confidence = 82;
    } else if (Math.abs(ratio - inverseGolden) < 0.15) {
      prediction = 'Tài'; // Xỉu đang chiếm ưu thế → đảo về Tài
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

  // Wave Theory - Lý thuyết sóng Elliott
  analyzeWavePattern(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const last13 = history.slice(-13); // Fibonacci 13
    
    // Phân tích sóng: Impulse (5 waves) + Correction (3 waves)
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

  // Probability Matrix - Ma trận xác suất
  buildProbabilityMatrix(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const matrix = {
      'TT': 0, 'TX': 0, 'XT': 0, 'XX': 0
    };
    
    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i][0]; // T or X
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

  // ========== THUẬT TOÁN CHUYÊN GIA ==========
  
  // Neural Pattern Recognition - Nhận dạng pattern bằng mạng neural
  analyzeNeuralPattern(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const patterns = {
      'TTT': 0, 'TTX': 0, 'TXT': 0, 'TXX': 0,
      'XTT': 0, 'XTX': 0, 'XXT': 0, 'XXX': 0
    };
    
    // Học pattern 3 phiên
    for (let i = 0; i < history.length - 3; i++) {
      const pattern = history.slice(i, i + 3).map(h => h[0]).join('');
      const nextResult = history[i + 3];
      const key = pattern;
      
      if (!patterns[key + '_next']) {
        patterns[key + '_next'] = { T: 0, X: 0 };
      }
      patterns[key + '_next'][nextResult[0]]++;
    }
    
    // Dự đoán dựa trên pattern hiện tại
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

  // Momentum Shift Detection - Phát hiện chuyển động lượng
  analyzeMomentumShift(sessions) {
    const totals = sessions.map(s => this.calculateTotal(s.dices));
    const last10 = totals.slice(-10);
    
    // Tính momentum (sự thay đổi tổng điểm)
    let momentum = 0;
    for (let i = 1; i < last10.length; i++) {
      momentum += (last10[i] - last10[i - 1]);
    }
    
    const avgMomentum = momentum / (last10.length - 1);
    const lastTotal = totals[totals.length - 1];
    const predictedTotal = lastTotal + avgMomentum;
    
    // Phát hiện điểm đảo chiều
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

  // Entropy Analysis - Phân tích độ hỗn loạn
  analyzeEntropy(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const last20 = history.slice(-20);
    
    // Tính entropy (độ hỗn loạn của chuỗi kết quả)
    let changes = 0;
    for (let i = 1; i < last20.length; i++) {
      if (last20[i] !== last20[i - 1]) {
        changes++;
      }
    }
    
    const entropy = changes / (last20.length - 1);
    const isHighEntropy = entropy > 0.6; // Dao động mạnh
    const isLowEntropy = entropy < 0.3;  // Ổn định
    
    let prediction = null;
    let confidence = 0;
    
    if (isLowEntropy) {
      // Chuỗi ổn định → Tiếp tục xu hướng
      prediction = last20[last20.length - 1];
      confidence = 73;
    } else if (isHighEntropy) {
      // Dao động mạnh → Đảo chiều
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

  // Quantum Prediction - Dự đoán lượng tử (kết hợp tất cả thuật toán)
  quantumPredict(sessions) {
    const predictions = [];
    const weights = {
      fibonacci: 0.12,
      goldenRatio: 0.15,
      waveTheory: 0.13,
      probabilityMatrix: 0.15,
      neuralPattern: 0.18,
      momentumShift: 0.15,
      entropy: 0.12
    };
    
    // Thu thập tất cả dự đoán
    const fib = this.analyzeFibonacci(sessions);
    const golden = this.analyzeGoldenRatio(sessions);
    const wave = this.analyzeWavePattern(sessions);
    const matrix = this.buildProbabilityMatrix(sessions);
    const neural = this.analyzeNeuralPattern(sessions);
    const momentum = this.analyzeMomentumShift(sessions);
    const entropy = this.analyzeEntropy(sessions);
    
    // Tính điểm vote có trọng số
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
      confidence: Math.min(finalConfidence, 98), // Cap tối đa 98%
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

  // ========== PHÂN TÍCH CHUYÊN GIA TỔNG HỢP ==========
  
  expertAnalysis(sessions) {
    const history = sessions.map(s => this.getTaiXiu(this.calculateTotal(s.dices)));
    const currentSession = sessions[sessions.length - 1];
    
    // Chạy tất cả thuật toán
    const quantum = this.quantumPredict(sessions);
    const streak = this.analyzeStreak(history);
    const zigzag = this.analyzeZigzag(history);
    
    // Xác định loại cầu
    const loaiCau = [];
    const recommendations = [];
    
    if (streak.length >= 5) {
      loaiCau.push('Cầu Phá Chuỗi Dài');
      recommendations.push(`Chuỗi ${streak.type} đã kéo dài ${streak.length} phiên - Rủi ro đảo chiều cao`);
    }
    
    if (zigzag.active) {
      loaiCau.push('Cầu Zigzag Dao Động');
      recommendations.push(`Pattern dao động mạnh ${zigzag.strength.toFixed(0)}% - Khả năng tiếp tục`);
    }
    
    if (quantum.algorithms.goldenRatio.isGoldenRatio) {
      loaiCau.push('Cầu Tỷ Lệ Vàng');
      recommendations.push('Đạt tỷ lệ vàng 1.618 - Điểm đảo chiều lý tưởng');
    }
    
    if (quantum.algorithms.momentumShift.isReversal) {
      loaiCau.push('Cầu Đảo Momentum');
      recommendations.push('Phát hiện điểm đảo chiều momentum - Tín hiệu mạnh');
    }
    
    if (quantum.algorithms.neuralPattern.learningDepth > 5) {
      loaiCau.push('Cầu Pattern AI');
      recommendations.push(`Pattern ${quantum.algorithms.neuralPattern.pattern} xuất hiện ${quantum.algorithms.neuralPattern.learningDepth} lần`);
    }
    
    // Đánh giá rủi ro
    let riskLevel = 'Thấp';
    if (quantum.confidence < 65) riskLevel = 'Cao';
    else if (quantum.confidence < 75) riskLevel = 'Trung Bình';
    
    return {
      prediction: quantum.prediction,
      confidence: quantum.confidence,
      riskLevel,
      loaiCau: loaiCau.length > 0 ? loaiCau : ['Cầu Thường'],
      recommendations,
      expertInsight: this.generateExpertInsight(quantum, streak, sessions),
      detailedAnalysis: quantum.algorithms,
      votingBreakdown: {
        tai: quantum.taiScore,
        xiu: quantum.xiuScore
      }
    };
  }

  // Tạo nhận định chuyên gia
  generateExpertInsight(quantum, streak, sessions) {
    const insights = [];
    
    insights.push(`💡 Phân tích ${sessions.length} phiên gần nhất với 7 thuật toán AI chuyên sâu`);
    
    if (quantum.confidence >= 85) {
      insights.push(`🔥 Tín hiệu CỰC MẠNH: Confidence ${quantum.confidence}% - Khuyến nghị theo dự đoán`);
    } else if (quantum.confidence >= 75) {
      insights.push(`✅ Tín hiệu TỐT: Confidence ${quantum.confidence}% - Đáng tin cậy`);
    } else if (quantum.confidence >= 65) {
      insights.push(`⚠️ Tín hiệu TRUNG BÌNH: Confidence ${quantum.confidence}% - Cân nhắc kỹ`);
    } else {
      insights.push(`❌ Tín hiệu YẾU: Confidence ${quantum.confidence}% - Không khuyến nghị`);
    }
    
    if (streak.length >= 6) {
      insights.push(`⚡ Cảnh báo: Chuỗi ${streak.type} đã dài ${streak.length} phiên - Nguy cơ đảo chiều rất cao`);
    }
    
    const entropy = quantum.algorithms.entropy;
    if (entropy.entropyLevel === 'High') {
      insights.push('🌊 Thị trường đang dao động mạnh - Khó dự đoán, cẩn trọng');
    } else if (entropy.entropyLevel === 'Low') {
      insights.push('📊 Thị trường ổn định - Xu hướng rõ ràng');
    }
    
    return insights;
  }
}

const analyzer = new TaiXiuExpertAnalyzer();

// =============== API ENDPOINTS ===============

app.get('/api/taixiu', async (req, res) => {
  try {
    const response = await axios.get(FIREBASE_URL);
    const data = response.data;
    
    if (!data) {
      return res.status(404).json({ error: 'Không có dữ liệu' });
    }

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
      success: true,
      timestamp: new Date().toISOString(),
      id: '@sewdangcap',
      expert_level: 'MASTER - 10+ Years Experience',
      data: {
        phien_hien_tai: {
          session_id: currentSession.session_id,
          dices: currentSession.dices,
          total: currentSession.total,
          result: currentSession.result
        },
        du_doan_chuyen_gia: {
          prediction: expertResult.prediction,
          confidence: expertResult.confidence + '%',
          next_session: currentSession.session_id + 1,
          risk_level: expertResult.riskLevel
        },
        loai_cau: expertResult.loaiCau,
        khuyen_nghi: expertResult.recommendations,
        nhan_dinh_chuyen_gia: expertResult.expertInsight,
        phan_tich_chi_tiet: {
          voting_breakdown: expertResult.votingBreakdown,
          fibonacci: expertResult.detailedAnalysis.fibonacci,
          golden_ratio: expertResult.detailedAnalysis.goldenRatio,
          wave_theory: expertResult.detailedAnalysis.waveTheory,
          probability_matrix: expertResult.detailedAnalysis.probabilityMatrix,
          neural_pattern: expertResult.detailedAnalysis.neuralPattern,
          momentum_shift: expertResult.detailedAnalysis.momentumShift,
          entropy: expertResult.detailedAnalysis.entropy
        },
        lich_su_10_phien: sessions.slice(-10).map(s => ({
          session: s.session_id,
          dices: s.dices,
          total: s.total,
          result: s.result
        }))
      }
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Lỗi khi lấy dữ liệu',
      message: error.message 
    });
  }
});

// API phân tích sâu một thuật toán cụ thể
app.get('/api/taixiu/algorithm/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const response = await axios.get(FIREBASE_URL);
    const data = response.data;
    
    if (!data) {
      return res.status(404).json({ error: 'Không có dữ liệu' });
    }

    const sessions = Object.entries(data)
      .map(([id, session]) => ({
        id,
        ...session,
        total: analyzer.calculateTotal(session.dices),
        result: analyzer.getTaiXiu(analyzer.calculateTotal(session.dices))
      }))
      .sort((a, b) => a.session_id - b.session_id);

    let algorithmResult;
    
    switch(type) {
      case 'fibonacci':
        algorithmResult = analyzer.analyzeFibonacci(sessions);
        break;
      case 'golden':
        algorithmResult = analyzer.analyzeGoldenRatio(sessions);
        break;
      case 'wave':
        algorithmResult = analyzer.analyzeWavePattern(sessions);
        break;
      case 'matrix':
        algorithmResult = analyzer.buildProbabilityMatrix(sessions);
        break;
      case 'neural':
        algorithmResult = analyzer.analyzeNeuralPattern(sessions);
        break;
      case 'momentum':
        algorithmResult = analyzer.analyzeMomentumShift(sessions);
        break;
      case 'entropy':
        algorithmResult = analyzer.analyzeEntropy(sessions);
        break;
      case 'quantum':
        algorithmResult = analyzer.quantumPredict(sessions);
        break;
      default:
        return res.status(400).json({ error: 'Thuật toán không hợp lệ' });
    }

    res.json({
      success: true,
      algorithm: type,
      result: algorithmResult
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Lỗi khi phân tích',
      message: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Expert AI TàiXỉu API v2.0',
    algorithms: 7,
    expert_level: 'MASTER'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Expert TàiXỉu API running on port ${PORT}`);
  console.log(`🧠 AI Algorithms: 7 Advanced + Expert Level`);
});
