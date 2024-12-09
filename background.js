class CryptoMonitorBackend {
    constructor() {
        this.measurements = new Map();
        this.activeOperations = new Set();
    }

    async startMonitoring(operationType, options = {}) {
        console.log(`Starting monitoring for ${operationType}`);
        this.activeOperations.add(operationType);
        this.measurements.set(operationType, []);

        const measurementInterval = setInterval(async () => {
            if (!this.activeOperations.has(operationType)) {
                clearInterval(measurementInterval);
                return;
            }

            try {
                const [cpuInfo, memoryInfo] = await Promise.all([
                    chrome.system.cpu.getInfo(),
                    chrome.system.memory.getInfo()
                ]);

                const measurement = {
                    timestamp: Date.now(),
                    cpu: this.calculateCPUUsage(cpuInfo),
                    memory: this.calculateMemoryUsage(memoryInfo),
                    operationType
                };

                this.measurements.get(operationType).push(measurement);
            } catch (error) {
                console.error('Error collecting metrics:', error);
            }
        }, options.intervalMs || 1000);
    }

    calculateCPUUsage(cpuInfo) {
        return cpuInfo.processors.reduce((acc, processor) => {
            const usage = processor.usage;
            return acc + (usage.user + usage.kernel) / usage.total;
        }, 0) / cpuInfo.processors.length * 100;
    }

    calculateMemoryUsage(memoryInfo) {
        return (memoryInfo.capacity - memoryInfo.availableCapacity) / memoryInfo.capacity * 100;
    }

    async stopMonitoring(operationType) {
        this.activeOperations.delete(operationType);
        const measurements = this.measurements.get(operationType);
        const analysis = this.analyzeResults(measurements);
        await this.storeResults(operationType, analysis);
        return analysis;
    }

    analyzeResults(measurements) {
        if (!measurements?.length) return null;

        const cpuUsages = measurements.map(m => m.cpu);
        const memoryUsages = measurements.map(m => m.memory);

        return {
            cpu: {
                average: this.calculateAverage(cpuUsages),
                max: Math.max(...cpuUsages),
                min: Math.min(...cpuUsages)
            },
            memory: {
                average: this.calculateAverage(memoryUsages),
                max: Math.max(...memoryUsages),
                min: Math.min(...memoryUsages)
            },
            sampleCount: measurements.length,
            duration: measurements[measurements.length - 1].timestamp - measurements[0].timestamp
        };
    }

    calculateAverage(array) {
        return array.reduce((a, b) => a + b, 0) / array.length;
    }

    async storeResults(operationType, results) {
        await chrome.storage.local.set({
            [`results_${operationType}_${Date.now()}`]: results
        });
    }
}

const backend = new CryptoMonitorBackend();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const handleError = (error) => {
        console.error('Operation failed:', error);
        sendResponse({ error: error.message });
    };

    try {
        switch (request.action) {
            case 'startMonitoring':
                backend.startMonitoring(request.operationType, request.options)
                    .then(() => sendResponse({ status: 'started' }))
                    .catch(handleError);
                break;

            case 'stopMonitoring':
                backend.stopMonitoring(request.operationType)
                    .then(results => sendResponse({ status: 'stopped', results }))
                    .catch(handleError);
                break;

            default:
                sendResponse({ error: 'Unknown action' });
        }
    } catch (error) {
        handleError(error);
    }

    return true;
});