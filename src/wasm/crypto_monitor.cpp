// crypto_monitor.cpp
#include <emscripten/bind.h>
#include <emscripten/emscripten.h>
#include <vector>
#include <map>
#include <cmath>
#include <algorithm>
#include <chrono>
#include <cmath>
#include <numeric>  // for accumulate and inner_product
#include <functional> // for arithmetic operations in algorithms

class EnhancedCryptoMonitor {
private:
    enum class CryptoOperation {
        AES_ENCRYPT,
        AES_DECRYPT,
        RSA_ENCRYPT,
        RSA_DECRYPT,
        ECDSA_SIGN,
        ECDSA_VERIFY,
        SHA256_HASH,
        KEY_DERIVATION
    };

    struct CryptoMetrics {
        // Timing metrics
        uint64_t start_cycle;
        uint64_t end_cycle;
        uint64_t start_inst;
        uint64_t end_inst;
        
        // Cache metrics
        struct CacheMetrics {
            uint64_t l1_accesses;
            uint64_t l1_misses;
            uint64_t l2_misses;
            uint64_t l3_misses;
            double miss_rate;
        } cache;
        
        // Branch prediction metrics
        struct BranchMetrics {
            uint64_t total_branches;
            uint64_t mispredictions;
            double mispredict_rate;
        } branch;
        
        // Power analysis
        struct PowerMetrics {
            double start_energy;
            double end_energy;
            double voltage_fluctuation;
            double current_draw;
            std::vector<double> power_trace;
        } power;
        
        // Memory metrics
        struct MemoryMetrics {
            uint64_t page_faults;
            uint64_t tlb_misses;
            uint64_t memory_bandwidth;
            std::vector<uint64_t> access_patterns;
        } memory;

        // RSA-specific metrics
        struct RSASpecificMetrics {
            uint64_t modulus_size;
            uint64_t modular_exponentiation_count;
            uint64_t montgomery_multiplications;
            
            struct OperationMetrics {
                uint64_t start_cycle;
                uint64_t end_cycle;
                std::vector<uint64_t> square_timings;
                std::vector<uint64_t> multiply_timings;
                std::vector<uint64_t> reduce_timings;
            } operations;
            
            struct RSACacheMetrics {
                uint64_t key_load_misses;
                uint64_t modulus_load_misses;
                uint64_t montgomery_cache_misses;
            } cache_specific;
            
            struct RSAMemoryMetrics {
                uint64_t key_memory_accesses;
                uint64_t temp_buffer_accesses;
                std::vector<uint64_t> memory_access_pattern;
            } memory_specific;
        } rsa_metrics;

        // Crypto specific metrics
        struct CryptoSpecific {
            uint64_t key_size;
            uint64_t block_size;
            uint64_t rounds;
            std::vector<uint64_t> round_timings;
            std::vector<double> round_power;
        } crypto_specific;
    };

    // Storage for measurements
    std::map<CryptoOperation, std::vector<CryptoMetrics>> operation_measurements;
    
    // Performance timing
    uint64_t get_timestamp() {
        return std::chrono::duration_cast<std::chrono::nanoseconds>(
            std::chrono::high_resolution_clock::now().time_since_epoch()
        ).count();
    }

    // Simulated performance counter
    uint64_t read_pmc(int counter) {
        static uint64_t counters[16] = {0};
        counters[counter]++;
        return counters[counter];
    }

    // Simulated power monitoring
    double measure_power_consumption() {
        static double power = 0.1;
        power += 0.01;
        return power;
    }

    // Cache monitoring
    void monitor_cache_behavior(CryptoMetrics& metrics) {
        metrics.cache.l1_accesses = read_pmc(0x1);
        metrics.cache.l1_misses = read_pmc(0x2);
        metrics.cache.l2_misses = read_pmc(0x3);
        metrics.cache.l3_misses = read_pmc(0x4);
        
        if (metrics.cache.l1_accesses > 0) {
            metrics.cache.miss_rate = static_cast<double>(metrics.cache.l1_misses) / 
                                    metrics.cache.l1_accesses;
        }
    }

// Branch prediction monitoring
    void monitor_branch_behavior(CryptoMetrics& metrics) {
        metrics.branch.total_branches = read_pmc(0x5);
        metrics.branch.mispredictions = read_pmc(0x6);
        
        if (metrics.branch.total_branches > 0) {
            metrics.branch.mispredict_rate = static_cast<double>(metrics.branch.mispredictions) / 
                                           metrics.branch.total_branches;
        }
    }

    // Memory access pattern monitoring
    void monitor_memory_behavior(CryptoMetrics& metrics) {
        metrics.memory.tlb_misses = read_pmc(0x7);
        metrics.memory.page_faults = read_pmc(0x8);
        metrics.memory.memory_bandwidth = read_pmc(0x9);
    }

    // RSA-specific monitoring
    void monitor_rsa_operation(CryptoMetrics& metrics) {
        auto& rsa = metrics.rsa_metrics;
        
        // Monitor modular arithmetic operations
        rsa.operations.square_timings.push_back(get_timestamp());
        
        // Monitor cache behavior specific to RSA
        rsa.cache_specific.key_load_misses = read_pmc(0x10);
        rsa.cache_specific.modulus_load_misses = read_pmc(0x11);
        
        // Monitor memory access patterns
        uint64_t current_memory_access = read_pmc(0x12);
        rsa.memory_specific.memory_access_pattern.push_back(current_memory_access);
    }

public:
    void startCryptoOperation(const std::string& operation_type, uint64_t key_size) {
        CryptoOperation op = parseCryptoOperation(operation_type);
        CryptoMetrics metrics;
        
        // Initialize timing
        metrics.start_cycle = get_timestamp();
        metrics.start_inst = read_pmc(0);
        
        // Initialize power monitoring
        metrics.power.start_energy = measure_power_consumption();
        
        // Set crypto-specific parameters
        metrics.crypto_specific.key_size = key_size;
        
        // Start standard monitoring
        monitor_cache_behavior(metrics);
        monitor_branch_behavior(metrics);
        monitor_memory_behavior(metrics);
        
        // Add RSA-specific monitoring if applicable
        if (op == CryptoOperation::RSA_ENCRYPT || op == CryptoOperation::RSA_DECRYPT) {
            monitor_rsa_operation(metrics);
        }
        
        operation_measurements[op].push_back(metrics);
    }

    void recordRoundMetrics(const std::string& operation_type, uint64_t round) {
        CryptoOperation op = parseCryptoOperation(operation_type);
        if (!operation_measurements[op].empty()) {
            auto& current_metrics = operation_measurements[op].back();
            
            uint64_t round_cycles = get_timestamp();
            current_metrics.crypto_specific.round_timings.push_back(round_cycles);
            
            double round_power = measure_power_consumption();
            current_metrics.crypto_specific.round_power.push_back(round_power);
            
            current_metrics.crypto_specific.rounds = round + 1;
        }
    }

    void endCryptoOperation(const std::string& operation_type) {
        CryptoOperation op = parseCryptoOperation(operation_type);
        if (!operation_measurements[op].empty()) {
            auto& metrics = operation_measurements[op].back();
            
            metrics.end_cycle = get_timestamp();
            metrics.end_inst = read_pmc(0);
            
            metrics.power.end_energy = measure_power_consumption();
            
            monitor_cache_behavior(metrics);
            monitor_branch_behavior(metrics);
            monitor_memory_behavior(metrics);
        }
    }

    emscripten::val analyzeRSAPerformance(const std::string& operation_type) {
        auto results = emscripten::val::object();
        CryptoOperation op = parseCryptoOperation(operation_type);
        
        if (op == CryptoOperation::RSA_ENCRYPT || op == CryptoOperation::RSA_DECRYPT) {
            const auto& measurements = operation_measurements[op];
            
            std::vector<double> modular_exp_times;
            std::vector<double> memory_patterns;
            std::vector<double> cache_patterns;
            
            for (const auto& metric : measurements) {
                auto& ops = metric.rsa_metrics.operations;
                for (size_t i = 1; i < ops.square_timings.size(); ++i) {
                    modular_exp_times.push_back(
                        static_cast<double>(ops.square_timings[i] - ops.square_timings[i-1])
                    );
                }
                
                auto& mem = metric.rsa_metrics.memory_specific;
                for (size_t i = 1; i < mem.memory_access_pattern.size(); ++i) {
                    memory_patterns.push_back(
                        static_cast<double>(mem.memory_access_pattern[i] - 
                                          mem.memory_access_pattern[i-1])
                    );
                }
                
                auto& cache = metric.rsa_metrics.cache_specific;
                cache_patterns.push_back(static_cast<double>(cache.key_load_misses));
                cache_patterns.push_back(static_cast<double>(cache.modulus_load_misses));
            }
            
            results.set("modular_exponentiation_times", modular_exp_times);
            results.set("memory_access_patterns", memory_patterns);
            results.set("cache_behavior", cache_patterns);
            results.set("statistical_analysis", computeStatistics(modular_exp_times));
        }
        
        return results;
    }

    emscripten::val analyzeTimingSideChannels(const std::string& operation_type) {
        auto results = emscripten::val::object();
        CryptoOperation op = parseCryptoOperation(operation_type);
        
        if (operation_measurements.find(op) != operation_measurements.end()) {
            const auto& measurements = operation_measurements[op];
            
            std::vector<double> execution_times;
            std::vector<double> round_variations;
            std::vector<double> power_variations;
            
            for (const auto& metric : measurements) {
                execution_times.push_back(
                    static_cast<double>(metric.end_cycle - metric.start_cycle)
                );
                
                for (size_t i = 1; i < metric.crypto_specific.round_timings.size(); ++i) {
                    round_variations.push_back(
                        static_cast<double>(
                            metric.crypto_specific.round_timings[i] - 
                            metric.crypto_specific.round_timings[i-1]
                        )
                    );
                }
                
                for (size_t i = 1; i < metric.crypto_specific.round_power.size(); ++i) {
                    power_variations.push_back(
                        metric.crypto_specific.round_power[i] - 
                        metric.crypto_specific.round_power[i-1]
                    );
                }
            }
            
            results.set("execution_times", execution_times);
            results.set("round_variations", round_variations);
            results.set("power_variations", power_variations);
            results.set("statistical_analysis", computeStatistics(execution_times));
        }
        
        return results;
    }

    emscripten::val analyzeCacheBehavior(const std::string& operation_type) {
        auto results = emscripten::val::object();
        CryptoOperation op = parseCryptoOperation(operation_type);
        
        if (operation_measurements.find(op) != operation_measurements.end()) {
            const auto& measurements = operation_measurements[op];
            
            std::vector<double> l1_miss_rates;
            std::vector<double> l2_miss_rates;
            std::vector<double> l3_miss_rates;
            
            for (const auto& metric : measurements) {
                l1_miss_rates.push_back(metric.cache.miss_rate);
            }
            
            results.set("l1_miss_rates", l1_miss_rates);
            results.set("l2_miss_rates", l2_miss_rates);
            results.set("l3_miss_rates", l3_miss_rates);
        }
        
        return results;
    }

    emscripten::val getResearchMetrics(const std::string& operation_type) {
        auto results = emscripten::val::object();
        results.set("timing_analysis", analyzeTimingSideChannels(operation_type));
        results.set("cache_analysis", analyzeCacheBehavior(operation_type));
        if (operation_type == "RSA_ENCRYPT" || operation_type == "RSA_DECRYPT") {
            results.set("rsa_analysis", analyzeRSAPerformance(operation_type));
        }
        return results;
    }

private:
    CryptoOperation parseCryptoOperation(const std::string& operation_type) {
        static const std::map<std::string, CryptoOperation> op_map = {
            {"AES_ENCRYPT", CryptoOperation::AES_ENCRYPT},
            {"AES_DECRYPT", CryptoOperation::AES_DECRYPT},
            {"RSA_ENCRYPT", CryptoOperation::RSA_ENCRYPT},
            {"RSA_DECRYPT", CryptoOperation::RSA_DECRYPT},
            {"ECDSA_SIGN", CryptoOperation::ECDSA_SIGN},
            {"ECDSA_VERIFY", CryptoOperation::ECDSA_VERIFY},
            {"SHA256_HASH", CryptoOperation::SHA256_HASH},
            {"KEY_DERIVATION", CryptoOperation::KEY_DERIVATION}
        };
        
        auto it = op_map.find(operation_type);
        return (it != op_map.end()) ? it->second : CryptoOperation::AES_ENCRYPT;
    }

    emscripten::val computeStatistics(const std::vector<double>& data) {
        auto stats = emscripten::val::object();
        
        if (data.empty()) return stats;
        
        double sum = std::accumulate(data.begin(), data.end(), 0.0);
        double mean = sum / data.size();
        
        std::vector<double> deviations;
        std::transform(data.begin(), data.end(), std::back_inserter(deviations),
                      [mean](double x) { return x - mean; });
        
        double sq_sum = std::inner_product(deviations.begin(), deviations.end(),
                                         deviations.begin(), 0.0);
        double stddev = std::sqrt(sq_sum / data.size());
        
        stats.set("mean", mean);
        stats.set("stddev", stddev);
        stats.set("min", *std::min_element(data.begin(), data.end()));
        stats.set("max", *std::max_element(data.begin(), data.end()));
        
        return stats;
    }
};

EMSCRIPTEN_BINDINGS(enhanced_crypto_monitor) {
    emscripten::class_<EnhancedCryptoMonitor>("EnhancedCryptoMonitor")
        .constructor<>()
        .function("startCryptoOperation", &EnhancedCryptoMonitor::startCryptoOperation)
        .function("recordRoundMetrics", &EnhancedCryptoMonitor::recordRoundMetrics)
        .function("endCryptoOperation", &EnhancedCryptoMonitor::endCryptoOperation)
        .function("analyzeTimingSideChannels", &EnhancedCryptoMonitor::analyzeTimingSideChannels)
        .function("analyzeCacheBehavior", &EnhancedCryptoMonitor::analyzeCacheBehavior)
        .function("analyzeRSAPerformance", &EnhancedCryptoMonitor::analyzeRSAPerformance)
        .function("getResearchMetrics", &EnhancedCryptoMonitor::getResearchMetrics);
}