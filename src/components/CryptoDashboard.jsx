// src/components/CryptoDashboard.jsx
import React, { useState, useEffect } from 'react';

const CryptoDashboard = () => {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [operationType, setOperationType] = useState('AES_ENCRYPT');
    const [monitoringData, setMonitoringData] = useState(null);

    const startMonitoring = () => {
        chrome.runtime.sendMessage({
            action: 'startMonitoring',
            operationType: operationType,
            options: { intervalMs: 1000 }
        }, response => {
            console.log('Monitoring started:', response);
            setIsMonitoring(true);
        });
    };

    const stopMonitoring = () => {
        chrome.runtime.sendMessage({
            action: 'stopMonitoring',
            operationType: operationType
        }, response => {
            console.log('Monitoring stopped:', response);
            setIsMonitoring(false);
            if (response.results) {
                setMonitoringData(response.results);
            }
        });
    };

    const renderMetrics = () => {
        if (!monitoringData) return null;

        return (
            <div style={{ marginTop: '20px' }}>
                <h3>Performance Metrics:</h3>
                <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '300px'
                }}>
                    {JSON.stringify(monitoringData, null, 2)}
                </pre>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '20px' }}>Crypto Monitor</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <select 
                    value={operationType} 
                    onChange={(e) => setOperationType(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px' }}
                >
                    <option value="AES_ENCRYPT">AES Encryption</option>
                    <option value="RSA_ENCRYPT">RSA Encryption</option>
                    <option value="SHA256_HASH">SHA-256 Hash</option>
                </select>

                <button 
                    onClick={isMonitoring ? stopMonitoring : startMonitoring}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: isMonitoring ? '#dc3545' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                </button>
            </div>

            {renderMetrics()}

            <div style={{ 
                padding: '10px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                marginTop: '20px'
            }}>
                Status: {isMonitoring ? (
                    <span style={{ color: '#28a745' }}>Monitoring Active</span>
                ) : (
                    <span style={{ color: '#dc3545' }}>Stopped</span>
                )}
            </div>
        </div>
    );
};

const startMonitoring = () => {
  chrome.runtime.sendMessage({
      action: 'startMonitoring',
      operationType: operationType
  }, response => {
      console.log('Monitoring started:', response);
      setIsMonitoring(true);
  });
};

const stopMonitoring = () => {
  chrome.runtime.sendMessage({
      action: 'stopMonitoring',
      operationType: operationType
  }, response => {
      console.log('Monitoring stopped:', response);
      console.log('Detailed metrics:', response.results);
      setIsMonitoring(false);
      setMonitoringData(response.results);
  });
};

export default CryptoDashboard;