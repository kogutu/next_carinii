import { useState, useRef, useEffect } from "react";

/* ── Brand colors as CSS vars + custom utility classes + keyframes ── */
const brandCSS = `
  :root {
    --hert: #000000;
    --hhert: #3b1535;
    --car: #000000;
    --hcar: #ec003f;
    --hertwhite: #f8f4f1;
    --menuhover: #3b1535;
    --horange: #ff6900;
    --hgold: #d6b17b;
    --hborder: #adadad;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
  @keyframes scaleIn { from { opacity:0; transform:translate(-50%,-50%) scale(.95) } to { opacity:1; transform:translate(-50%,-50%) scale(1) } }
  @keyframes tooltipIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }

  .animate-fadeIn { animation: fadeIn .2s ease }
  .animate-slideUp { animation: slideUp .3s cubic-bezier(.22,1,.36,1) }
  .animate-scaleIn { animation: scaleIn .25s cubic-bezier(.22,1,.36,1) }
  .animate-tooltipIn { animation: tooltipIn .15s ease }

  .bg-hertwhite { background-color: var(--hertwhite) }
  .bg-hhert { background-color: var(--hhert) }
  .bg-hgold { background-color: var(--hgold) }
  .bg-hcar { background-color: var(--hcar) }
  .bg-hhert-overlay { background-color: rgba(59,21,53,0.50) }
  .bg-hhert-light { background-color: rgba(59,21,53,0.08) }
  .bg-hgold-light { background-color: rgba(214,177,123,0.12) }

  .text-hert { color: var(--hert) }
  .text-hhert { color: var(--hhert) }
  .text-hcar { color: var(--hcar) }
  .text-hgold { color: var(--hgold) }
  .text-hborder { color: var(--hborder) }

  .border-hborder { border-color: var(--hborder) }
  .border-hhert { border-color: var(--hhert) }
  .border-hgold { border-color: var(--hgold) }
  .border-hcar { border-color: var(--hcar) }

  .stroke-hhert { stroke: var(--hhert) }
  .stroke-hborder { stroke: var(--hborder) }

  .size-btn { transition: all .2s ease }
  .size-btn:hover:not(.size-selected):not(.size-unavail) {
    border-color: var(--hgold) !important;
    box-shadow: 0 0 0 1px var(--hgold);
    transform: translateY(-1px);
  }
  .size-btn:hover.size-unavail {
    border-color: #c5c0bc !important;
    transform: translateY(-1px);
  }

  .btn-notify:hover { background-color: var(--hhert) !important }
  .btn-notify:active { transform: scale(0.98) }

  .link-guide:hover { color: var(--hhert) !important }

  .input-email:focus {
    border-color: var(--hgold) !important;
    box-shadow: 0 0 0 3px rgba(214,177,123,0.25);
  }
`;

/* ── Tooltip ── */
function Tooltip({ children, content }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const tipRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (show && ref.current && tipRef.current) {
      const r = ref.current.getBoundingClientRect();
      const t = tipRef.current.getBoundingClientRect();
      setPos({
        top: r.top - t.height - 8,
        left: r.left + r.width / 2 - t.width / 2,
      });
    }
  }, [show]);

  return (
    <span
      ref={ref}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      className="relative inline-flex"
    >
      {children}
      {show && (
        <span
          ref={tipRef}
          className="fixed z-50 px-3 py-1.5 rounded-md bg-black text-white text-xs whitespace-nowrap pointer-events-none animate-tooltipIn"
          style={{ top: pos.top, left: pos.left }}
        >
          {content}

          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-black" />
        </span>
      )}
    </span>
  );
}

/* ── Drawer ── */
function Drawer({ open, onClose, size, onSubmit }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setEmail(""); setConsent(false); setSubmitted(false); setError(""); }
  }, [open]);

  const handleSubmit = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Podaj prawidłowy adres email"); return;
    }
    if (!consent) { setError("Wymagana zgoda na przetwarzanie danych"); return; }
    setError("");
    setSubmitted(true);
    onSubmit?.({ email, size });
  };

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-50 bg-hhert-overlay backdrop-blur-sm animate-fadeIn" />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl px-7 pt-8 pb-10 max-h-[85vh] overflow-y-auto shadow-2xl animate-slideUp">
        <div className="flex justify-center mb-6">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer">
          ✕
        </button>

        {submitted ? (
          <div className="text-center py-5">
            <div className="w-14 h-14 rounded-full bg-hhert-light inline-flex items-center justify-center mb-4 text-2xl text-hhert">✓</div>
            <h3 className="text-xl font-medium mb-2 text-hert">Dziękujemy!</h3>
            <p className="text-sm text-hborder leading-relaxed">
              Powiadomimy Cię gdy rozmiar {size} będzie dostępny.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-hgold-light inline-flex items-center justify-center mb-3">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="stroke-hhert" strokeWidth="1.5">
                  <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-medium text-center mb-2 text-hert">
              Rozmiar {size} jest chwilowo niedostępny
            </h3>
            <p className="text-center text-sm text-hborder leading-relaxed mb-7 max-w-sm mx-auto">
              Zostaw swój adres email, a poinformujemy Cię niezwłocznie gdy Twój rozmiar będzie dostępny.
            </p>

            <div className="mb-5">
              <label className="block text-xs font-medium text-hborder mb-1.5 uppercase tracking-wider">
                Adres email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.pl"
                className={`input-email w-full px-4 py-3.5 rounded-lg text-sm bg-hertwhite text-hert outline-none border-2 transition-all ${error && !email ? "border-hcar" : "border-gray-200"
                  }`}
              />
            </div>

            <label className="flex gap-2.5 items-start cursor-pointer mb-6">
              <span
                onClick={() => setConsent(!consent)}
                className={`shrink-0 w-5 h-5 rounded mt-0.5 border-2 inline-flex items-center justify-center transition-all ${error && !consent ? "border-hcar" : consent ? "border-hhert bg-hhert" : "border-gray-300"
                  }`}
              >
                {consent && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-xs text-gray-400 leading-relaxed">
                Wyrażam zgodę na otrzymywanie od Carinii z siedzibą w Garwolinie drogą elektroniczną,
                za pomocą wiadomości e-mail, informacji handlowych dotyczących usług i produktów własnych.
              </span>
            </label>

            {error && <p className="text-hcar text-sm text-center mb-4">{error}</p>}

            <button onClick={handleSubmit} className="btn-notify w-full py-4 bg-black text-white rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-all">
              Powiadom mnie
            </button>
          </>
        )}
      </div>
    </>
  );
}

/* ── Size Guide Modal ── */
function SizeGuide({ open, onClose }) {
  if (!open) return null;

  const rows = [
    { eu: 35, cm: 22.5, uk: 2.5, us: 5 },
    { eu: 36, cm: 23.0, uk: 3.5, us: 6 },
    { eu: 37, cm: 23.5, uk: 4, us: 6.5 },
    { eu: 38, cm: 24.5, uk: 5, us: 7.5 },
    { eu: 39, cm: 25.0, uk: 6, us: 8 },
    { eu: 40, cm: 25.5, uk: 6.5, us: 8.5 },
    { eu: 41, cm: 26.5, uk: 7.5, us: 9.5 },
  ];

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-50 bg-hhert-overlay backdrop-blur-sm animate-fadeIn" />
      <div
        className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl p-8 w-[min(420px,90vw)] max-h-[80vh] overflow-y-auto shadow-2xl animate-scaleIn"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer">
          ✕
        </button>

        <h3 className="text-lg font-medium mb-1 text-hert">Przewodnik po rozmiarach</h3>
        <p className="text-xs text-hborder mb-5">Zmierz stopę i porównaj z tabelą poniżej</p>

        <table className="w-full text-sm">
          <thead>
            <tr>
              {["EU", "CM", "UK", "US"].map((h) => (
                <th key={h} className="py-2.5 px-2 text-center text-xs font-semibold uppercase tracking-wider text-hborder border-b-2 border-gray-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.eu} className={i % 2 === 0 ? "" : "bg-hertwhite"}>
                <td className="py-2.5 px-2 text-center font-medium text-hert">{r.eu}</td>
                <td className="py-2.5 px-2 text-center text-hborder">{r.cm}</td>
                <td className="py-2.5 px-2 text-center text-hborder">{r.uk}</td>
                <td className="py-2.5 px-2 text-center text-hborder">{r.us}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 p-3.5 bg-hgold-light rounded-lg text-xs text-gray-500 leading-relaxed">
          <strong className="text-hhert">Wskazówka:</strong> Zmierz stopę wieczorem —
          jest wtedy nieco większa. Postaw stopę na kartce, obrysuj i zmierz odległość od pięty do
          najdłuższego palca.
        </div>
      </div>
    </>
  );
}

/* ── Main SizeSwatch ── */
export default function SizeSwatch({
  setVariant,
  image_thumbnail = "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80",
  size_qty = { roz35: 0, roz36: 2, roz37: 2, roz38: 2, roz39: 1, roz40: 0, roz41: 0 },
  sku = "Carinii B7718-R24",
} = {}) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSize, setDrawerSize] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const sizes = Object.entries(size_qty).map(([key, qty]) => ({
    label: key.replace("roz", ""),
    qty,
    key,
  }));


  const handleSizeClick = (size) => {
    if (size.qty > 0) {
      setSelectedSize(size.key);
    } else {
      setDrawerSize(size.label);
      setDrawerOpen(true);
    }
    setVariant({ "size": size.label, "sku": sku });
  };

  return (
    <>
      <style>{brandCSS}</style>

      <div >


        <b><span className="text-red-600">*</span> Wybierz swój rozmiar:</b>
        <div className="h-px bg-gray-100 mx-6" />

        {/* Size grid */}
        <div className="py-6 ">
          <div className="grid grid-cols-4  md:grid-cols-5 lg:grid-cols-6 gap-2.5">
            {sizes.map((size) => {
              const available = size.qty > 0;
              const selected = selectedSize === size.key;

              var last = false;
              if (size.qty <= 1 && size.qty > 0) last = true

              return (
                <Tooltip
                  key={size.key}
                  content={available ? (!last ? `Dostępny` : `Ostatnia sztuka`) : "Niedostępny — kliknij by powiadomić"}
                >
                  <button
                    onClick={() => handleSizeClick(size)}
                    className={`size-btn w-full h-12  text-sm font-medium cursor-pointer relative ${selected
                      ? "size-selected bg-hcar border-2 border-hcar text-white font-semibold"
                      : available
                        ? "bg-white border border-hborder text-hert"
                        : "size-unavail  border border-gray-200 text-gray-300"
                      }`}
                  >
                    {size.label}
                    {(last && size.qty > 0) && (
                      <span className="text-hcar absolute top-0 t-0 l-0">■</span>
                    )}
                    {!available && (
                      <span className="absolute top-1/2 left-1/2 w-[70%] h-px bg-gray-300 -translate-x-1/2 -translate-y-1/2 -rotate-[20deg] opacity-70" />
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Size guide */}
        <div className=" pb-6 flex items-center gap-1.5">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="stroke-hborder" strokeWidth="1.5">
            <path d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5M20.25 16.5V18a2.25 2.25 0 01-2.25 2.25h-1.5M3.75 16.5V18a2.25 2.25 0 002.25 2.25h1.5" strokeLinecap="round" />
          </svg>
          <button
            onClick={() => setGuideOpen(true)}
            className="link-guide text-xs text-hborder underline underline-offset-2 cursor-pointer transition-colors"
          >
            Przewodnik po rozmiarach
          </button>
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} size={drawerSize} onSubmit={(data) => console.log("Notify:", data)} />
      <SizeGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}