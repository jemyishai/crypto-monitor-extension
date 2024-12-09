// statistical_analysis.js
class CryptoStatisticalAnalysis {
  constructor() {
    this.analysisResults = new Map();
  }

  /**
   * Analyze timing data for potential side-channel vulnerabilities
   * @param {Array} timings - Array of execution times
   * @param {string} operationType - Type of cryptographic operation
   * @returns {Object} Statistical analysis results
   */
  analyzeTimingDistribution(timings, operationType) {
    const results = {
      basic: this.computeBasicStats(timings),
      distribution: this.analyzeDistribution(timings),
      sideChannel: this.assessSideChannelRisk(timings),
      timeSeriesAnalysis: this.analyzeTimeSeries(timings)
    };

    this.analysisResults.set(`${operationType}_timing`, results);
    return results;
  }

  /**
   * Analyze cache behavior for potential vulnerabilities
   * @param {Array} cacheMisses - Array of cache miss rates
   * @param {string} operationType - Type of cryptographic operation
   * @returns {Object} Cache analysis results
   */
  analyzeCacheBehavior(cacheMisses, operationType) {
    const results = {
      missRateStats: this.computeBasicStats(cacheMisses),
      patterns: this.detectCachePatterns(cacheMisses),
      vulnerabilityAssessment: this.assessCacheVulnerability(cacheMisses)
    };

    this.analysisResults.set(`${operationType}_cache`, results);
    return results;
  }

  /**
   * Analyze power consumption patterns
   * @param {Array} powerReadings - Array of power consumption measurements
   * @param {string} operationType - Type of cryptographic operation
   * @returns {Object} Power analysis results
   */
  analyzePowerConsumption(powerReadings, operationType) {
    const results = {
      powerStats: this.computeBasicStats(powerReadings),
      dpa: this.differentialPowerAnalysis(powerReadings),
      anomalies: this.detectPowerAnomalies(powerReadings)
    };

    this.analysisResults.set(`${operationType}_power`, results);
    return results;
  }

  /**
   * Compute basic statistical metrics
   * @param {Array} data - Array of numerical measurements
   * @returns {Object} Basic statistical metrics
   */
  computeBasicStats(data) {
    const n = data.length;
    if (n === 0) return null;

    const mean = data.reduce((a, b) => a + b) / n;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const sorted = [...data].sort((a, b) => a - b);

    return {
      mean,
      median: sorted[Math.floor(n/2)],
      stdDev,
      cv: (stdDev / mean) * 100, // Coefficient of variation
      min: Math.min(...data),
      max: Math.max(...data),
      q1: sorted[Math.floor(n/4)],
      q3: sorted[Math.floor(3*n/4)],
      skewness: this.calculateSkewness(data, mean, stdDev),
      kurtosis: this.calculateKurtosis(data, mean, stdDev)
    };
  }

  /**
   * Analyze distribution characteristics
   * @param {Array} data - Array of measurements
   * @returns {Object} Distribution analysis results
   */
  analyzeDistribution(data) {
    return {
      histogram: this.generateHistogram(data),
      normalityTest: this.shapiroWilkTest(data),
      outliers: this.detectOutliers(data)
    };
  }

  /**
   * Assess potential side-channel vulnerabilities
   * @param {Array} data - Array of measurements
   * @returns {Object} Vulnerability assessment results
   */
  assessSideChannelRisk(data) {
    const stats = this.computeBasicStats(data);
    
    return {
      timingVariability: stats.cv > 1.0, // Flag if CV > 1%
      consistencyScore: this.calculateConsistencyScore(data),
      outlierRisk: this.assessOutlierRisk(data),
      recommendedMitigations: this.generateMitigationRecommendations(stats)
    };
  }

  /**
   * Perform time series analysis
   * @param {Array} data - Array of time series data
   * @returns {Object} Time series analysis results
   */
  analyzeTimeSeries(data) {
    return {
      trend: this.calculateTrend(data),
      seasonality: this.detectSeasonality(data),
      autocorrelation: this.calculateAutocorrelation(data),
      changePoints: this.detectChangePoints(data)
    };
  }

  /**
   * Detect patterns in cache behavior
   * @param {Array} cacheMisses - Array of cache miss rates
   * @returns {Object} Cache pattern analysis results
   */
  detectCachePatterns(cacheMisses) {
    return {
      regularPatterns: this.findRegularPatterns(cacheMisses),
      anomalousPatterns: this.detectAnomalousPatterns(cacheMisses),
      riskAssessment: this.assessCachePatternRisk(cacheMisses)
    };
  }

  /**
   * Perform differential power analysis
   * @param {Array} powerReadings - Array of power measurements
   * @returns {Object} DPA results
   */
  differentialPowerAnalysis(powerReadings) {
    return {
      correlations: this.calculatePowerCorrelations(powerReadings),
      peaks: this.detectPowerPeaks(powerReadings),
      vulnerabilityScore: this.assessPowerLeakage(powerReadings)
    };
  }

  /**
   * Generate comprehensive analysis report
   * @param {string} operationType - Type of cryptographic operation
   * @returns {Object} Comprehensive analysis report
   */
  generateReport(operationType) {
    const report = {
      operationType,
      timestamp: new Date().toISOString(),
      timing: this.analysisResults.get(`${operationType}_timing`),
      cache: this.analysisResults.get(`${operationType}_cache`),
      power: this.analysisResults.get(`${operationType}_power`),
      recommendations: this.generateSecurityRecommendations(operationType)
    };

    return report;
  }
}

export default CryptoStatisticalAnalysis;
