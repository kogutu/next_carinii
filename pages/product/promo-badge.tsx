import { ProductBoxView } from "@/components/promo/PromoViews";
import { useProductCampaigns } from "@/components/promo/PromoProvider";

// Boks z kodem rabatowym na karcie produktu. Pokazuje się, gdy któraś kampania z panelu /admin (zakładka Promo)
// jest aktywna i obejmuje ten produkt (przecenione / nieprzecenione / kategorie); treść i kolory też stamtąd.
const PromoBadge = ({ product }: { product: any }) => {
  const { productBox } = useProductCampaigns(product);
  if (productBox.length === 0) return null;

  return (
    <div className="flex flex-col items-start gap-2">
      {productBox.map((campaign) => (
        <ProductBoxView key={campaign.id} box={campaign.productBox} code={campaign.code} percent={campaign.percent} />
      ))}
    </div>
  );
};

export default PromoBadge;
