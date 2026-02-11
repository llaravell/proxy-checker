import React, { useState } from 'react';
import { ProxyItem, CheckStatus } from '../types';
import { CheckCircle2, XCircle, Loader2, Copy, Check, Send } from 'lucide-react';

interface ProxyTableProps {
  proxies: ProxyItem[];
}

const ProxyTable: React.FC<ProxyTableProps> = ({ proxies }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTelegramLink = (proxy: ProxyItem) => {
    // Only strictly valid for SOCKS, but useful to have the button anyway
    const link = `https://t.me/socks?server=${proxy.ip}&port=${proxy.port}`;
    window.open(link, '_blank');
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full max-h-[500px]">
      <div className="grid grid-cols-12 gap-2 p-3 bg-slate-900 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
        <div className="col-span-1">#</div>
        <div className="col-span-5">آدرس IP:Port</div>
        <div className="col-span-2">پروتکل</div>
        <div className="col-span-3">وضعیت</div>
        <div className="col-span-1 text-left pl-2">پینگ</div>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {proxies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500">
            <p>لیست خالی است.</p>
          </div>
        ) : (
          proxies.map((proxy, idx) => (
            <div 
              key={proxy.id} 
              className={`grid grid-cols-12 gap-2 p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors text-sm items-center font-mono ${
                proxy.status === CheckStatus.WORKING ? 'bg-green-500/5' : 
                proxy.status === CheckStatus.DEAD ? 'bg-red-500/5' : ''
              }`}
            >
              <div className="col-span-1 text-slate-500">{idx + 1}</div>
              
              <div className="col-span-5 text-slate-200 flex items-center gap-2 group">
                {/* Country Flag Circle */}
                {proxy.status === CheckStatus.WORKING && proxy.country && (
                   <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-600 shrink-0" title={proxy.country}>
                     <img 
                       src={`https://flagcdn.com/w40/${proxy.country.toLowerCase()}.png`} 
                       alt={proxy.country}
                       className="w-full h-full object-cover"
                     />
                   </div>
                )}
                
                <span dir="ltr" className="text-left truncate">{proxy.ip}:{proxy.port}</span>
                
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleCopy(proxy.id, `${proxy.ip}:${proxy.port}`)}
                    className="text-slate-500 hover:text-blue-400 p-1"
                    title="کپی آدرس"
                  >
                    {copiedId === proxy.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    onClick={() => handleTelegramLink(proxy)}
                    className="text-slate-500 hover:text-blue-400 p-1"
                    title="اتصال در تلگرام"
                  >
                    <Send className="w-3.5 h-3.5 transform -rotate-45 mb-0.5" />
                  </button>
                </div>
              </div>

              <div className="col-span-2">
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 font-bold">
                  {proxy.protocol}
                </span>
              </div>
              
              <div className="col-span-3 flex items-center">
                {proxy.status === CheckStatus.IDLE && <span className="text-slate-500 text-xs">در انتظار</span>}
                {proxy.status === CheckStatus.CHECKING && <div className="flex items-center text-blue-400 text-xs"><Loader2 className="w-3 h-3 animate-spin ml-1"/> در حال تست</div>}
                {proxy.status === CheckStatus.WORKING && <div className="flex items-center text-green-400 text-xs font-bold"><CheckCircle2 className="w-3 h-3 ml-1"/> فعال</div>}
                {proxy.status === CheckStatus.DEAD && <div className="flex items-center text-red-400 text-xs"><XCircle className="w-3 h-3 ml-1"/> خراب</div>}
              </div>
              
              <div className="col-span-1 text-left pl-2 text-xs text-slate-400" dir="ltr">
                {proxy.latency ? `${proxy.latency}ms` : '-'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProxyTable;