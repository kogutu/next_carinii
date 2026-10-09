import { Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { normalizeMediaUrl } from "@/lib/mediaUrl";

interface Product {
    id: string | number;
    url: string;
    img: string;
    name: string;
    hcolor: string;
}

interface RelatedProductsProps {
    products: Product[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
    if (!products)
        return null
    return (
        <div className="border rounded-xl p-2">
            <b>Inne warianty kolorytyczne: </b>
            <div className="flex flex-wrap gap-2 mt-2 ">
                {products?.map((product) => (
                    <div key={product.name} className="item-rel relative w-20 border border-gray-100 hover:border-hgold aspect-[2/3]">
                        <Link href={product.url}>
                            <Image
                                src={normalizeMediaUrl(product.img)}
                                alt={`Zobacz ${product.name}`}
                                title={product.name}
                                fill
                                className="object-cover"
                            />

                        </Link>
                        <div className="roundcolor z-1 w-6 h-6 m-1 border-white border-2 absolute bottom-0 left-0" style={{ background: (product as any).hc }}>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;