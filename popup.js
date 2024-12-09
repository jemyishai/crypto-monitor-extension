// import React, { useState } from 'react';
// import { createRoot } from 'react-dom/client';

// const Popup = () => {
//   const [isMonitoring, setIsMonitoring] = useState(false);
//   const [selectedOperation, setSelectedOperation] = useState('AES_ENCRYPT');
//   const [results, setResults] = useState(null);

//   const startMonitoring = () => {
//     chrome.runtime.sendMessage({
//       action: 'startMonitoring',
//       operationType: selectedOperation,
//       options: { intervalMs: 1000 }
//     }, (response) => {
//       if (response && response.status === 'started') {
//         setIsMonitoring(true);
//       }
//     });
//   };

//   const stopMonitoring = () => {
//     chrome.runtime.sendMessage({
//       action: 'stopMonitoring',
//       operationType: selectedOperation
//     }, (response) => {
//       if (response) {
//         setIsMonitoring(false);
//         if (response.results) {
//           setResults(response.results);
//         }
//       }
//     });
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <h1 style={{ marginBottom: '20px' }}>Crypto Monitor</h1>
      
//       <div style={{ marginBottom: '20px' }}>
//         <select 
//           value={selectedOperation}
//           onChange={(e) => setSelectedOperation(e.target.value)}
//           style={{ marginRight: '10px', padding: '5px' }}
//         >
//           <option value="AES_ENCRYPT">AES Encryption</option>
//           <option value="RSA_ENCRYPT">RSA Encryption</option>
//           <option value="SHA256_HASH">SHA-256 Hash</option>
//         </select>

//         <button
//           onClick={isMonitoring ? stopMonitoring : startMonitoring}
//           style={{
//             padding: '8px 16px',
//             backgroundColor: isMonitoring ? '#dc3545' : '#28a745',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//         >
//           {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
//         </button>
//       </div>

//       {results && (
//         <div style={{ marginTop: '20px' }}>
//           <h3>Performance Metrics:</h3>
//           <pre style={{
//             backgroundColor: '#f5f5f5',
//             padding: '10px',
//             borderRadius: '4px',
//             overflow: 'auto',
//             maxHeight: '300px'
//           }}>
//             {JSON.stringify(results, null, 2)}
//           </pre>
//         </div>
//       )}

//       <div style={{
//         padding: '10px',
//         backgroundColor: '#f8f9fa',
//         borderRadius: '4px',
//         marginTop: '20px'
//       }}>
//         Status: {isMonitoring ? 
//           <span style={{ color: '#28a745' }}>Monitoring Active</span> : 
//           <span style={{ color: '#dc3545' }}>Stopped</span>
//         }
//       </div>
//     </div>
//   );
// };

// document.addEventListener('DOMContentLoaded', () => {
//     const root = document.getElementById('root');
//     const reactRoot = createRoot(root);
//     reactRoot.render(<Popup />);
//   });

// export default Popup;

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const Popup = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('AES_ENCRYPT');
  const [results, setResults] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState(null);

  useEffect(() => {
    let interval;
    if (isMonitoring) {
      interval = setInterval(() => {
        Promise.all([
          chrome.system.cpu.getInfo(),
          chrome.system.memory.getInfo()
        ]).then(([cpuInfo, memoryInfo]) => {
          const cpuUsage = cpuInfo.processors.reduce((acc, p) => {
            const usage = p.usage;
            return acc + (usage.user + usage.kernel) / usage.total;
          }, 0) / cpuInfo.processors.length * 100;

          const memoryUsage = (memoryInfo.capacity - memoryInfo.availableCapacity) / memoryInfo.capacity * 100;

          setLiveMetrics({
            cpu: cpuUsage.toFixed(2),
            memory: memoryUsage.toFixed(2),
            timestamp: new Date().toLocaleTimeString()
          });
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring]);

  const startMonitoring = () => {
    chrome.runtime.sendMessage({
      action: 'startMonitoring',
      operationType: selectedOperation,
      options: { intervalMs: 1000 }
    }, (response) => {
      if (response && response.status === 'started') {
        setIsMonitoring(true);
      }
    });
  };

  const stopMonitoring = () => {
    chrome.runtime.sendMessage({
      action: 'stopMonitoring',
      operationType: selectedOperation
    }, (response) => {
      if (response) {
        setIsMonitoring(false);
        if (response.results) {
          setResults(response.results);
        }
      }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Crypto Monitor</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <select 
          value={selectedOperation}
          onChange={(e) => setSelectedOperation(e.target.value)}
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

      {liveMetrics && isMonitoring && (
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px'
        }}>
          <h3 style={{ marginBottom: '10px' }}>Live Metrics:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>CPU Usage:</div>
              <div>{liveMetrics.cpu}%</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>Memory Usage:</div>
              <div>{liveMetrics.memory}%</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
            Last updated: {liveMetrics.timestamp}
          </div>
        </div>
      )}

      {results && (
        <div style={{ marginTop: '20px' }}>
          <h3>Performance Metrics:</h3>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <div style={{
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        marginTop: '20px'
      }}>
        Status: {isMonitoring ? 
          <span style={{ color: '#28a745' }}>Monitoring Active</span> : 
          <span style={{ color: '#dc3545' }}>Stopped</span>
        }
      </div>
    </div>
  );
};

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  const reactRoot = createRoot(root);
  reactRoot.render(<Popup />);
});

export default Popup;