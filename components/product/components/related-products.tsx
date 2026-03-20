import ProductCarousel from "../ProductsCarusel";

interface RelatedProductsProps {
    pids: number[];
}

export function RelatedProducts({ pids }: RelatedProductsProps) {
    const ids = pids.map(id => id.toString());

    const filterQuery = `filter_by=pid:[${ids.join(",")}]`;
    const url = `https://mebel-partner.pl/devback/typesense/api/collections/meble/documents/search?q=*&page=1&per_page=18&exclude_fields=embedding,imgs,charakterystyka_string,description,specyfikacja_string,charakterystyka,specyfikacja&${filterQuery}`;

    return (
        <div className="related_products px-4 md:px-0 mt-12">
            <div className="relative border p-4 rounded-2xl border-[1.5px] shadow-lg">
                <div className="flex gap-2 items-baseline "><div className="line rounded-full overflow-hidden bg-mpgold w-5 h-5"></div><span><span className="text-lg "></span><b className="text-xl md:text-2xl font-bold uppercase  text-mpgray  ">Produkty powiązane </b></span></div>



                <ProductCarousel url={url} />
            </div>
        </div>
    );
}
