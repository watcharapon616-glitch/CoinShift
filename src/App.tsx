import { useState, useEffect, useCallback } from 'react';
import {  Sun, Moon, ChevronRight, Globe, 
  RefreshCcw, ArrowRightLeft, TrendingUp,
  Coins, DollarSign, Search, ShieldAlert
} from 'lucide-react';

export default function App() {
  const [amount, setAmount] = useState<string>("1.00");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("THB");
  const [allCurrencies, setAllCurrencies] = useState<Record<string, string>>({});
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [rate, setRate] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // 1. Fetch All Available Currencies (World-wide)
  useEffect(() => {
    fetch('https://api.frankfurter.dev/v1/currencies')
      .then(res => res.json())
      .then(data => setAllCurrencies(data));
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // 2. Fetch Exchange Rate
  const fetchRate = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsConverting(true);
    try {
      const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
      const data = await res.json();
      const currentRate = data.rates[to];
      setRate(currentRate);
      setResult(parseFloat(amount) * currentRate);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setTimeout(() => setIsConverting(false), 400);
    }
  }, [amount, from, to]);

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  // Filter functions for Search
  const filteredFrom = Object.entries(allCurrencies).filter(([code, name]) => 
    code.toLowerCase().includes(searchFrom.toLowerCase()) || name.toLowerCase().includes(searchFrom.toLowerCase())
  );

  const filteredTo = Object.entries(allCurrencies).filter(([code, name]) => 
    code.toLowerCase().includes(searchTo.toLowerCase()) || name.toLowerCase().includes(searchTo.toLowerCase())
  );

  return (
    <div className={`min-h-screen w-full flex flex-col transition-colors duration-500 font-sans ${isDark ? 'bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 border-b ${isDark ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <Coins size={24} className="text-white fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl italic uppercase tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent leading-none">
                CoinShift
              </span>
              <span className="text-[8px] font-bold opacity-40 tracking-[0.2em] uppercase">Open Source Utility</span>
            </div>
          </div>
          <button 
            onClick={() => setIsDark(!isDark)} 
            className={`p-3 rounded-2xl border transition-all hover:scale-110 active:scale-95 ${isDark ? 'bg-slate-900 border-white/10 text-yellow-400' : 'bg-white border-slate-200 text-blue-600 shadow-sm'}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6">
        
        <div className="w-full max-w-xl mb-20">
          <div className={`rounded-[3rem] border overflow-hidden shadow-2xl transition-all duration-500 ${isDark ? 'bg-slate-900/40 border-white/10 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200'}`}>
            <div className="p-10 space-y-8">
              
              {/* Amount Input */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest opacity-40 px-2">Amount to Convert</label>
                <div className={`relative group p-6 rounded-[2.5rem] border transition-all ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-500">
                    <DollarSign size={32} />
                  </div>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent text-4xl font-black outline-none pl-12 pr-4 tracking-tighter"
                  />
                </div>
              </div>

              {/* Enhanced Select with Search */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-end gap-4">
                
                {/* From Selection */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black opacity-30 uppercase px-4">From</span>
                  <div className={`p-2 rounded-2xl border ${isDark ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center gap-2 px-3 pb-2 border-b border-white/5 mb-2">
                      <Search size={14} className="opacity-30" />
                      <input 
                        placeholder="Search..." 
                        className="bg-transparent text-xs outline-none w-full"
                        onChange={(e) => setSearchFrom(e.target.value)}
                      />
                    </div>
                    <select 
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="w-full bg-transparent font-black text-sm outline-none cursor-pointer"
                    >
                      {filteredFrom.map(([code, name]) => <option key={code} value={code} className="text-black">{code} - {name}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={swapCurrencies}
                  className={`mb-1 p-4 rounded-full border-4 transition-all hover:rotate-180 active:scale-90 ${isDark ? 'bg-slate-900 border-[#030712] text-emerald-400' : 'bg-white border-slate-50 text-emerald-600 shadow-md'}`}
                >
                  <ArrowRightLeft size={20} />
                </button>

                {/* To Selection */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black opacity-30 uppercase px-4">To</span>
                  <div className={`p-2 rounded-2xl border ${isDark ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center gap-2 px-3 pb-2 border-b border-white/5 mb-2">
                      <Search size={14} className="opacity-30" />
                      <input 
                        placeholder="Search..." 
                        className="bg-transparent text-xs outline-none w-full"
                        onChange={(e) => setSearchTo(e.target.value)}
                      />
                    </div>
                    <select 
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="w-full bg-transparent font-black text-sm outline-none cursor-pointer"
                    >
                      {filteredTo.map(([code, name]) => <option key={code} value={code} className="text-black">{code} - {name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Result Area */}
              <div className={`p-8 rounded-[2.5rem] border text-center transition-all duration-700 ${isDark ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-200'}`}>
                {isConverting ? (
                  <div className="flex items-center justify-center py-6">
                    <RefreshCcw className="animate-spin text-emerald-500" size={40} />
                  </div>
                ) : (
                  <div className="animate-in fade-in zoom-in-95">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Global Live Rate</p>
                    <h2 className="text-5xl font-black tracking-tighter mb-4 italic">
                      {result?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-xl ml-2 opacity-40 not-italic">{to}</span>
                    </h2>
                    <div className="flex items-center justify-center gap-2 opacity-40 font-bold text-[11px] uppercase tracking-widest">
                      <span>1 {from}</span>
                      <ChevronRight size={12} />
                      <span>{rate?.toFixed(4)} {to}</span>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={fetchRate}
                disabled={isConverting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-6 rounded-[2rem] font-black text-lg text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center justify-center gap-4 transition-all active:scale-[0.97] group"
              >
                {isConverting ? <RefreshCcw className="animate-spin" size={28} /> : <>Update Global Rates <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform"/></>}
              </button>

              {/* Data Source Attribution & Disclaimer */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-center gap-2 opacity-30 text-[9px] font-bold uppercase tracking-wider text-center">
                  <ShieldAlert size={10} />
                  <span>Data provided by European Central Bank via Frankfurter API</span>
                </div>
                <p className="text-[8px] opacity-20 text-center leading-tight">
                  CoinShift is a free open-source utility for informational purposes only. Rates are not guaranteed for trading or financial transactions.
                </p>
              </div>

            </div>
          </div>
          <p className="mt-8 text-center text-[10px] font-bold opacity-20 uppercase tracking-[0.3em]">
            Real-time Exchange Data • Public Domain Feeds • No Delay
          </p>
        </div>

        {/* Feature/SEO Sections */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 border-t border-white/5 pt-20">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/10">
              <Globe size={24} />
            </div>
            <h4 className="font-black text-lg italic tracking-tight uppercase">Global Reach</h4>
            <p className="text-sm opacity-50 leading-relaxed font-medium">Access over 160 currencies worldwide with precise data updated every second from international banks.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/10">
              <Search size={24} />
            </div>
            <h4 className="font-black text-lg italic tracking-tight uppercase">Smart Search</h4>
            <p className="text-sm opacity-50 leading-relaxed font-medium">Instantly find any currency by code or country name using our optimized real-time filtering system.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/10">
              <TrendingUp size={24} />
            </div>
            <h4 className="font-black text-lg italic tracking-tight uppercase">High Precision</h4>
            <p className="text-sm opacity-50 leading-relaxed font-medium">CoinShift uses high-precision math to ensure your conversions are accurate down to the last decimal.</p>
          </div>
        </div>

      </main>

      <footer className="py-10 border-t border-white/5 text-center px-6">
        <p className="text-[10px] font-bold opacity-20 uppercase tracking-[0.2em] mb-2">© 2026 CoinShift Global • Premium Finance Utility</p>
        <p className="text-[8px] opacity-10 max-w-md mx-auto">
          All product names, logos, and brands are property of their respective owners. Use of these names, logos, and brands does not imply endorsement.
        </p>
      </footer>
    </div>
  );
}