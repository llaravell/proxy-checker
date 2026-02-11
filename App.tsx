import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Protocol, ProxyItem, CheckStatus } from './types';
import ProxyTable from './components/ProxyTable';
import StatsBoard from './components/StatsBoard';
import { Play, RotateCcw, ShieldCheck, Filter, Download, AlertTriangle, RotateCw } from 'lucide-react';
import { MOCK_LOGS } from './constants';

function App() {
  const [inputText, setInputText] = useState('');
  const [proxies, setProxies] = useState<ProxyItem[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol>(Protocol.SOCKS5);
  const [isScanning, setIsScanning] = useState(false);
  const [showWorkingOnly, setShowWorkingOnly] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Parse IPs from textarea
  const handleParse = () => {
    // Regex for IP:Port
    const regex = /((?:\d{1,3}\.){3}\d{1,3})[:\s]+(\d{2,5})/g;
    let match;
    const newProxies: ProxyItem[] = [];
    
    while ((match = regex.exec(inputText)) !== null) {
      newProxies.push({
        id: crypto.randomUUID(),
        ip: match[1],
        port: parseInt(match[2]),
        protocol: selectedProtocol,
        status: CheckStatus.IDLE,
      });
    }

    // Remove duplicates based on IP:Port
    const uniqueProxies = Array.from(new Map(newProxies.map(item => [`${item.ip}:${item.port}`, item])).values());
    
    setProxies(uniqueProxies);
  };

  // Mock checking logic
  const handleStartScan = useCallback(async () => {
    if (proxies.length === 0) return;
    
    setIsScanning(true);
    abortControllerRef.current = new AbortController();

    // Reset statuses
    setProxies(prev => prev.map(p => ({ ...p, status: CheckStatus.IDLE, latency: undefined, country: undefined })));

    // Simulation logic
    const BATCH_SIZE = 5;
    const items = [...proxies];
    
    // Common country codes for simulation
    const simulatedCountries = ['US', 'DE', 'GB', 'FR', 'NL', 'SG', 'JP', 'TR', 'AE', 'CA'];
    
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      if (abortControllerRef.current?.signal.aborted) break;

      const batch = items.slice(i, i + BATCH_SIZE);
      
      // Mark batch as checking
      setProxies(prev => prev.map(p => 
        batch.find(b => b.id === p.id) ? { ...p, status: CheckStatus.CHECKING } : p
      ));

      // Wait random time to simulate network IO
      await new Promise(r => setTimeout(r, Math.random() * 500 + 300));

      // Randomly assign success/fail and metadata
      setProxies(prev => prev.map(p => {
        if (batch.find(b => b.id === p.id)) {
          // 40% chance of working in this simulation
          const isWorking = Math.random() > 0.6; 
          
          if (isWorking) {
            return {
              ...p,
              status: CheckStatus.WORKING,
              latency: Math.floor(Math.random() * 400) + 20, // Random Ping
              country: simulatedCountries[Math.floor(Math.random() * simulatedCountries.length)]
            };
          } else {
            return {
              ...p,
              status: CheckStatus.DEAD
            };
          }
        }
        return p;
      }));
    }

    setIsScanning(false);
  }, [proxies]);

  const handleStopScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsScanning(false);
  };

  const handleExport = () => {
    const workingProxies = proxies.filter(p => p.status === CheckStatus.WORKING);
    const text = workingProxies.map(p => `${p.ip}:${p.port}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `working_proxies_${selectedProtocol}.txt`;
    a.click();
  };

  // Logic to process proxies for display: Filter -> Sort
  const displayedProxies = useMemo(() => {
    let list = [...proxies];

    // Filter
    if (showWorkingOnly) {
      list = list.filter(p => p.status === CheckStatus.WORKING);
    }

    // Sort: Working first, then Checking, then Idle, then Dead
    // Rank: Working=0, Checking=1, Idle=2, Dead=3
    const getRank = (status: CheckStatus) => {
      switch (status) {
        case CheckStatus.WORKING: return 0;
        case CheckStatus.CHECKING: return 1;
        case CheckStatus.IDLE: return 2;
        case CheckStatus.DEAD: return 3;
        default: return 4;
      }
    };

    list.sort((a, b) => {
      const rankA = getRank(a.status);
      const rankB = getRank(b.status);
      
      if (rankA !== rankB) {
        return rankA - rankB;
      }

      // If both are WORKING, sort by Latency (Ping) - Low to High
      if (a.status === CheckStatus.WORKING && b.status === CheckStatus.WORKING) {
        const pingA = a.latency || 9999;
        const pingB = b.latency || 9999;
        return pingA - pingB;
      }

      return 0;
    });

    return list;
  }, [proxies, showWorkingOnly]);

  return (
    <div className="min-h-screen bg-[#0b1121] text-slate-200 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                پروکسی‌اسکات پرو
              </h1>
            </div>
            <p className="text-slate-500 mt-1 text-sm">ابزار حرفه‌ای بررسی و تحلیل پروتکل</p>
          </div>
          <div className="flex gap-2">
             <div className="bg-slate-800 px-3 py-1 rounded text-xs text-slate-400 border border-slate-700 flex items-center">
                حالت شبیه‌سازی مرورگر
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Input */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
              <label className="block text-sm font-medium text-slate-400 mb-2 flex justify-between">
                <span>لیست ورودی (IP:Port)</span>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                  {proxies.length} بارگذاری شده
                </span>
              </label>
              <textarea
                className="w-full h-64 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-left"
                dir="ltr"
                placeholder={`101.132.248.7:3128\n103.163.244.106:1080\n...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="col-span-2">
                   <label className="text-xs text-slate-500 mb-1 block">پروتکل</label>
                   <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700" dir="ltr">
                     {[Protocol.SOCKS5, Protocol.SOCKS4, Protocol.HTTP].map((p) => (
                       <button
                         key={p}
                         onClick={() => setSelectedProtocol(p)}
                         className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                           selectedProtocol === p 
                           ? 'bg-blue-600 text-white shadow-lg' 
                           : 'text-slate-400 hover:text-white'
                         }`}
                       >
                         {p}
                       </button>
                     ))}
                   </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={handleParse}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors border border-slate-600 flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-4 h-4" /> بارگذاری لیست
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-900/10 border border-yellow-700/30 p-4 rounded-xl flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-yellow-200/70 leading-relaxed">
                <strong>محدودیت مرورگر:</strong> مرورگرها اجازه تست مستقیم اتصال SOCKS را نمی‌دهند. این ابزار صرفاً یک شبیه‌ساز UI است و پینگ و کشور را به صورت تصادفی تولید می‌کند.
              </p>
            </div>
          </div>

          {/* Right Panel: Results & Stats */}
          <div className="lg:col-span-2 flex flex-col h-full">
            
            <StatsBoard proxies={proxies} />

            <div className="flex-1 flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h2 className="text-lg font-semibold text-slate-200">نتایج اسکن</h2>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                   {/* Filter Toggle */}
                   <button
                    onClick={() => setShowWorkingOnly(!showWorkingOnly)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                      showWorkingOnly 
                      ? 'bg-green-600/20 text-green-400 border border-green-500/50' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    {showWorkingOnly ? 'نمایش همه' : 'فقط سالم‌ها'}
                  </button>

                  {!isScanning ? (
                     <button
                       onClick={handleStartScan}
                       disabled={proxies.length === 0}
                       className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <Play className="w-4 h-4 transform rotate-180" /> شروع اسکن
                     </button>
                  ) : (
                    <button
                       onClick={handleStopScan}
                       className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-red-900/20"
                     >
                       <RotateCcw className="w-4 h-4" /> توقف
                     </button>
                  )}
                  
                  <button
                    onClick={handleExport}
                    disabled={proxies.filter(p => p.status === CheckStatus.WORKING).length === 0}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" /> خروجی
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <ProxyTable proxies={displayedProxies} />
              </div>

              {/* Console / Log area */}
              <div className="mt-4 h-24 bg-black rounded-lg border border-slate-800 p-2 overflow-hidden font-mono text-[10px] text-green-400 opacity-70" dir="ltr">
                 <div className="mb-1 text-slate-500 text-right" dir="rtl">گزارش سیستم:</div>
                 {isScanning ? (
                    <div className="flex flex-col-reverse">
                       {MOCK_LOGS.map((log, i) => (
                          <div key={i} className="animate-pulse">> {log}</div>
                       ))}
                       <div>> Starting batch process...</div>
                    </div>
                 ) : (
                    <div className="text-slate-600">> Ready for input...</div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;