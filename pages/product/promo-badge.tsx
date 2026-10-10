import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { getPromo, usePromoActive } from "@/lib/promo";

type CouponPrice = {
  percent: number;
  finalPrice: number;
};

const formatPln = (value: number): string =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(value);

// Odznaka „kup taniej z kodem” na karcie produktu. Widoczna tylko w trakcie kampanii (data/promo.json),
// a rabat i cena z kodem pochodzą z Magento (kupon liczony dla tego produktu) — bez własnych wyliczeń.
const PromoBadge = ({ product }: { product: any }) => {
  const active = usePromoActive();
  const promo = getPromo();
  const [copied, setCopied] = useState(false);
  const [coupon, setCoupon] = useState<CouponPrice | null>(null);

  useEffect(() => {
    if (!active || !product?.pid) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/magento/discount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oids: String(product.pid), coupon: promo.code }),
        });
        const result = await response.json();
        const entry = result?.success ? result.products?.[0] : null;
        if (!cancelled && entry?.eligible && Number(entry.discount_amount_rule) > 0) {
          setCoupon({ percent: Number(entry.discount_amount_rule), finalPrice: Number(entry.final_price) });
        }
      } catch {
        // bez odpowiedzi z Magento nie pokazujemy odznaki — lepiej nic niż nieprawdziwy rabat
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, product?.pid, promo.code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = promo.code;
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

  if (!active || !coupon) return null;

  return (
    <div className="inline-block rounded-xl bg-primary p-3 text-[11px] leading-tight text-primary-foreground">
      Ten produkt kupisz teraz
      <span className="mt-1 block text-xl font-bold tracking-[2px]">
        {formatPln(coupon.finalPrice)}
      </span>
      <span className="mt-0.5 block text-xs text-primary-foreground/70">
        -{coupon.percent}% z kodem:
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Skopiuj kod ${promo.code}`}
          className="ml-1 inline-flex items-center gap-1.5 align-middle text-lg font-bold tracking-[2px] text-primary-foreground"
          translate="no"
        >
          {promo.code}
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4 opacity-70" aria-hidden="true" />}
        </button>
      </span>
      {promo.badgeNote && <span className="mt-2 block text-xs text-primary-foreground/70">{promo.badgeNote}</span>}
    </div>
  );
};

export default PromoBadge;
