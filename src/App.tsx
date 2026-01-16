import React, { useState, useEffect } from 'react';
import { 
  FileUp, X, CheckCircle2, Download, Zap, 
  ImageIcon, Loader2, Maximize2, Sun, Moon,
  RefreshCcw, FileText, ChevronRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import heic2any from 'heic2any';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState('jpg'); 
  const [selectedSize, setSelectedSize] = useState('original');
  const [isDark, setIsDark] = useState(true);
  
  const [customW, setCustomW] = useState('5.0');
  const [customH, setCustomH] = useState('5.0');
  const [unit, setUnit] = useState('cm');

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const handleConversion = async () => {
    if (!file) return;
    setIsConverting(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (file.type === 'application/pdf') {
        const pdfjsURL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs';
        const pdfjsLib = await import(/* @vite-ignore */ pdfjsURL);
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx!, viewport }).promise;
      } else {
        let currentFile: any = file;
        if (file.name.toLowerCase().endsWith('.heic')) {
          currentFile = await heic2any({ blob: file, toType: "image/jpeg" });
        }
        const img = new Image();
        const objectUrl = URL.createObjectURL(currentFile);
        img.src = objectUrl;
        await img.decode();
        const factor = unit === 'inch' ? 300 : 118.11;
        let finalW = selectedSize === 'original' ? img.width : parseFloat(customW) * factor;
        let finalH = selectedSize === 'original' ? img.height : parseFloat(customH) * factor;
        canvas.width = finalW;
        canvas.height = finalH;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
      }

      if (targetFormat === 'pdf') {
        const pdf = new jsPDF(canvas.width > canvas.height ? 'l' : 'p', 'px', [canvas.width, canvas.height]);
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, canvas.width, canvas.height);
        setDownloadUrl(pdf.output('datauristring'));
      } else {
        setDownloadUrl(canvas.toDataURL(`image/${targetFormat === 'png' ? 'png' : 'jpeg'}`, 0.9));
      }
      setIsDone(true);
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการแปลงไฟล์");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    
    <div className={`min-h-screen transition-colors duration-500 font-sans ${isDark ? 'bg-[#030712] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 border-b ${isDark ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={22} className="text-blue-500 fill-current" />
            <span className="font-black text-xl italic uppercase tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">OmniConv</span>
          </div>
          <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-white/10 text-yellow-400' : 'bg-white border-slate-200 text-blue-600 shadow-sm'}`}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-4 flex justify-center">
        <div className="w-full max-w-md">
          <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all ${isDark ? 'bg-slate-900/60 border-white/10 shadow-black' : 'bg-white border-slate-200'}`}>
            
            {!file ? (
              <label className="group cursor-pointer block">
                <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <div className="py-24 flex flex-col items-center text-center px-10">
                  <div className="w-20 h-20 rounded-3xl bg-blue-600/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
                    <FileUp size={36} />
                  </div>
                  <h2 className="text-2xl font-black mb-2 tracking-tight">เลือกไฟล์ของคุณ</h2>
                  <p className="text-xs opacity-40 font-bold uppercase tracking-widest">JPG • PNG • HEIC • PDF</p>
                </div>
              </label>
            ) : (
              <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                
                {/* File Info */}
                <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${file.type === 'application/pdf' ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {file.type === 'application/pdf' ? <FileText size={22} /> : <ImageIcon size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate leading-none mb-1">{file.name}</p>
                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => setFile(null)} className="hover:text-rose-500 transition-colors"><X size={20} /></button>
                </div>

                {!isDone ? (
                  <div className="space-y-8">
                    
                    {/* 1. เมนูเลือก Format (JPG, PNG, PDF) */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">แปลงไฟล์เป็นนามสกุล</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['jpg', 'png', 'pdf'].map(fmt => (
                          <button 
                            key={fmt} 
                            onClick={() => setTargetFormat(fmt)} 
                            className={`py-4 rounded-2xl font-black text-xs uppercase transition-all border-2 
                              ${targetFormat === fmt 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' 
                                : 'bg-transparent border-slate-200 dark:border-white/5 opacity-50 hover:opacity-100'}`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. ตั้งค่าขนาด (เฉพาะรูปภาพ) */}
                    {file.type !== 'application/pdf' && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">ตั้งค่าขนาด</label>
                        <div className="flex bg-slate-100 dark:bg-black/40 p-1.5 rounded-2xl border border-white/5">
                          {['original', 'custom'].map(m => (
                            <button key={m} onClick={() => setSelectedSize(m)} className={`flex-1 py-3 rounded-xl font-black text-[11px] uppercase transition-all ${selectedSize === m ? 'bg-white dark:bg-slate-800 text-blue-500 shadow-sm' : 'opacity-40'}`}>
                              {m === 'original' ? 'ขนาดเดิม' : 'กำหนดเอง'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. ช่องกรอกขนาด (ป้องกันพื้นหลังขาว/ล้น) */}
                    {selectedSize === 'custom' && file.type !== 'application/pdf' && (
                      <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'} space-y-6`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">หน่วยมาตราส่วน</span>
                          <div className="flex gap-2">
                            {['cm', 'inch'].map(u => (
                              <button key={u} onClick={() => setUnit(u)} className={`px-4 py-1 rounded-lg text-[10px] font-black transition-all ${unit === u ? 'bg-blue-600 text-white' : 'opacity-20 hover:opacity-100'}`}>{u}</button>
                            ))}
                          </div>
                        </div>
                        {/* แก้ปัญหาช่องล้นด้วย grid-cols-1 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <span className="text-[9px] font-black opacity-30 uppercase ml-2">กว้าง</span>
                            <input type="number" value={customW} onChange={(e) => setCustomW(e.target.value)} className={`w-full p-4 rounded-2xl text-center font-black text-lg outline-none ring-blue-500/40 focus:ring-4 transition-all ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 border border-slate-200'}`} />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[9px] font-black opacity-30 uppercase ml-2">สูง</span>
                            <input type="number" value={customH} onChange={(e) => setCustomH(e.target.value)} className={`w-full p-4 rounded-2xl text-center font-black text-lg outline-none ring-blue-500/40 focus:ring-4 transition-all ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 border border-slate-200'}`} />
                          </div>
                        </div>
                      </div>
                    )}

                    <button onClick={handleConversion} disabled={isConverting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-5 rounded-[1.75rem] font-black text-white shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                      {isConverting ? <Loader2 className="animate-spin" size={24} /> : <>เริ่มแปลงไฟล์ <ChevronRight size={20}/></>}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                      <CheckCircle2 size={48} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black mb-1 italic tracking-tighter uppercase">เรียบร้อย!</h3>
                      <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest font-sans">ไฟล์ถูกแปลงเป็น {targetFormat} แล้ว</p>
                    </div>
                    <div className="space-y-3 pt-4">
                      <a href={downloadUrl!} download={`omniconv_output.${targetFormat}`} className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl text-white font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95">
                        <Download size={24} /> <span>ดาวน์โหลดผลลัพธ์</span>
                      </a>
                      <button onClick={() => {setFile(null); setIsDone(false);}} className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 hover:opacity-100 transition-all pt-2">ทำรายการใหม่</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}