import Image from 'next/image';
import Link from 'next/link';

interface Product {
    pid: number;
    name: string;
    slug: string;
    image_main: string;
    final_price: number;
    special_price: number;
    has_special_price: boolean;
    url: string;
}

interface BoxHeroPrsProps {
    img: string;
    url: string;
    cat: string;
    side?: 'left' | 'right';
}

async function getPrCat(cid) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home/products_category?cid=` + cid, {
            next: { reactivate: 3600 }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await res.json();

        if (data.hits && Array.isArray(data.hits)) {
            return data.hits.map((hit: any) => {
                const product = hit.document || hit;
                return {
                    id: product.id || product.pid,
                    image_main: product.image_main,
                    name: product.name,
                    url: product.slug,
                    final_price: product.final_price,
                    special_price: product.special_price,
                    has_special_price: product.has_special_price,
                    sizes_qty: product.size_qty,
                    tag: product.new === '1' ? 'NOWOŚĆ' : ''
                };
            });
        }

        return [];
    } catch (error) {
        console.error('Error fetching newest products:', error);
        return [];
    }
}

export default async function BoxHeroPrs({ img, url, cat, side = 'left' }: BoxHeroPrsProps) {

    const products: Product[] = await getPrCat(cat);

    if (!products.length)
        return '';

    const imageBlock = (
        <div className="relative aspect-[2/3] w-full overflow-hidden">
            <Image
                src={img}
                alt={cat}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
            />
        </div>
    );

    const productsBlock = (
        <div className="aspect-[2/3] w-full overflow-y-auto p-4 bg-white">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                    <Link
                        key={product.pid}
                        href={`/${product.slug}`}
                        className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                        <div className="aspect-square relative overflow-hidden bg-gray-50">
                            <Image
                                src={product.image_main}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 45vw, (max-width: 768px) 20vw, 150px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="p-2">
                            <p className="text-xs leading-tight line-clamp-2 text-gray-700 group-hover:text-black transition-colors">
                                {product.name}
                            </p>
                            <p className="mt-1 text-sm font-semibold">
                                {product.has_special_price && product.special_price > 0 ? (
                                    <>
                                        <span className="text-red-600">{product.special_price} zł</span>
                                        <span className="ml-1 text-gray-400 line-through text-xs font-normal">
                                            {product.final_price} zł
                                        </span>
                                    </>
                                ) : (
                                    <span>{product.final_price} zł</span>
                                )}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2">
                {side === 'left' ? (
                    <>
                        {imageBlock}
                        {productsBlock}
                    </>
                ) : (
                    <>
                        {productsBlock}
                        {imageBlock}
                    </>
                )}
            </div>
        </div>
    );
}