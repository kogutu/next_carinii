import { Copy } from "lucide-react";
import { useState } from "react";

const PromoBadge = ({ code = "WOMAN", discount = "20%" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black text-white inline-block p-2.5 rounded text-[11px] leading-tight">
      Ten produkt kupisz teraz<br />
      <span className="text-xl font-bold tracking-[3px] block mt-1">
        20% taniej
      </span>
      <span className="block text-xs text-gray-300 mt-0.5">
        z kodem:
        <span className="text-xl font-bold tracking-[3px] text-white">
          WOMAN
        </span>
        <span >
          <Copy onClick={handleCopy} className="text-red-200 h-6 inline ml-2 relative -top-1" />
        </span>
      </span>
      <span className="block text-xs mt-2 text-gray-300">
        Upoluj najlepsze okazje na Dzień Kobiet!
      </span>
    </div>
  )

  return (
    <div>
      <div className="w-full max-w-xs bg-black text-white p-4 rounded-xl shadow-sm">
        <div className="mb-2">

          <p className="text-xs mb-1">Ten produkt kupisz teraz:</p>
          <h2 className="text-2xl font-bold">{discount} taniej</h2>
        </div>


        <button
          onClick={handleCopy}
          className="group w-full mb-3 border border-white/20  rounded-xl px-4 flex justify-between items-center hover:bg-white hover:text-black transition-all active:scale-95 relative overflow-hidden"
        >
          {copied ? (
            <div className="flex items-center justify-center gap-2 w-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-xs font-bold text-green-400 uppercase">
                Skopiowano do schowka!
              </span>
            </div>
          ) : (
            <>
              <div className="flex gap-2 items-baseline">
                <span className="text-[10px] opacity-60 font-sans">KOD:</span>
                <span className="font-mono font-bold text-lg uppercase">{code}</span>
              </div>
              <span className="text-[9px] font-bold border-l border-white/20 pl-3 group-hover:border-black/20 uppercase transition-colors">
                Skopiuj
              </span>
            </>
          )}
        </button>

        <p className="text-xs leading-relaxed">
          Upoluj najlepsze okazje na Dzień Kobiet!
        </p>
      </div>
    </div>
  );
};

export default PromoBadge;