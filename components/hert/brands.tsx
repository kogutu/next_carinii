'use client';

import Carousel from '@/components/carousel';
import { createSlug } from '@/utils/slugify';
import Link from 'next/link';


export interface Brand {
  id: string | number;
  name: string;
  logo?: string;
  link?: string;
}

interface BrandsCarouselProps {
  title?: string;
  brands: Brand[];
  isLoading?: boolean;
}

const BrandItem = (brand: Brand) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-24 flex items-center justify-center">

    {brand.logo ? (
      <Link href={`/` + brand.link}>
        <img
          src={brand.logo || "/placeholder.svg"}
          alt={brand.name}
          className="w-full h-full object-contain p-4"
        />
      </Link>
    ) : (
      <span className="font-bold text-gray-600 text-center px-4">{brand.name}</span>
    )}
  </div>
);

export default function BrandsCarousel() {
  let brands: any =
    [
      { id: 1, name: "Auxpama", logo: "https://www.hert.pl/media/logo/auxpama.jpg" },
      { id: 2, name: "Bake Off", logo: "https://www.hert.pl/media/logo/bakeoff.jpg" },
      { id: 3, name: "Bakon", logo: "https://www.hert.pl/media/logo/bakon.jpg" },
      { id: 4, name: "Bartscher", logo: "https://www.hert.pl/media/logo/bartscher1.jpg" },
      { id: 5, name: "Bazz", logo: "https://www.hert.pl/media/logo/bazz1.jpg" },
      { id: 6, name: "Bolarus", logo: "https://www.hert.pl/media/logo/bolarus.jpg" },
      { id: 7, name: "Brunner Anlinker", logo: "https://www.hert.pl/media/logo/brunner.jpg" },
      { id: 8, name: "Cebea", logo: "https://www.hert.pl/media/logo/cebea1.jpg" },
      { id: 9, name: "Doinghaus", logo: "https://www.hert.pl/media/logo/logo_doinghaus.jpg" },
      { id: 10, name: "Drutec", logo: "https://www.hert.pl/media/logo/drutec.jpg" },
      { id: 11, name: "Dubor", logo: "https://www.hert.pl/media/logo/dubor.jpg" },
      { id: 12, name: "E2M", logo: "https://www.hert.pl/media/logo/e2m.jpg" },
      { id: 13, name: "Edhard", logo: "https://www.hert.pl/media/logo/edhad.jpg" },     // poprawione z edhad
      { id: 14, name: "Emmedi", logo: "https://www.hert.pl/media/logo/emmedi.jpg" },
      { id: 15, name: "Fines", logo: "https://www.hert.pl/media/logo/fines.jpg" },
      { id: 16, name: "Firex", logo: "https://www.hert.pl/media/logo/firex.jpg" },
      { id: 17, name: "Follet", logo: "https://www.hert.pl/media/logo/follettt.jpg" },   // poprawione z follettt
      { id: 18, name: "Glass", logo: "https://www.hert.pl/media/logo/glass.jpg" },
      { id: 19, name: "Hagesana", logo: "https://www.hert.pl/media/logo/hagesana.jpg" },
      { id: 20, name: "GHD Hartmann", logo: "https://www.hert.pl/media/logo/hartmann1.jpg" },
      { id: 21, name: "Heinen", logo: "https://www.hert.pl/media/logo/heinen.jpg" },
      { id: 22, name: "Hematronic", logo: "https://www.hert.pl/media/logo/hematronic.jpg" },
      { id: 23, name: "Hoja Food Tec", logo: "https://www.hert.pl/media/logo/hoja.jpg" },
      { id: 24, name: "Innova", logo: "https://www.hert.pl/media/logo/innova.jpg" },
      { id: 25, name: "Irinox", logo: "https://www.hert.pl/media/logo/irinox.jpg" },
      { id: 26, name: "Jeros", logo: "https://www.hert.pl/media/logo/jeros.jpg" },
      { id: 27, name: "Kastel", logo: "https://www.hert.pl/media/logo/kastel.jpg" },
      { id: 28, name: "Komza", logo: "https://www.hert.pl/media/logo/komza.jpg" },
      { id: 29, name: "Krüger & Salecker", logo: "https://www.hert.pl/media/logo/kruger.jpg" },
      { id: 30, name: "Krumbein", logo: "https://www.hert.pl/media/logo/krumbein.jpg" },
      { id: 31, name: "Langheinz", logo: "https://www.hert.pl/media/logo/langheinz.jpg" },
      { id: 32, name: "Lantech", logo: "https://www.hert.pl/media/logo/lantech.jpg" },
      { id: 33, name: "Longoni", logo: "https://www.hert.pl/media/logo/longoni.jpg" },
      { id: 34, name: "Liebherr", logo: "https://www.hert.pl/media/logo/liebherr.jpg" },
      { id: 35, name: "Lumitech", logo: "https://www.hert.pl/media/logo/lumitech.jpg" },
      { id: 36, name: "Merand", logo: "https://www.hert.pl/media/logo/merand1.jpg" },
      { id: 37, name: "MFT", logo: "https://www.hert.pl/media/logo/mft.jpg" },
      { id: 38, name: "MHS", logo: "https://www.hert.pl/media/logo/mhs.jpg" },
      { id: 39, name: "MKN", logo: "https://www.hert.pl/media/logo/mkn.jpg" },
      { id: 40, name: "Moduline", logo: "https://www.hert.pl/media/logo/moduline.jpg" },
      { id: 41, name: "NBS-Schumann", logo: "https://www.hert.pl/media/logo/nbs1.jpg" },
      { id: 42, name: "Nemox", logo: "https://www.hert.pl/media/logo/nemox.jpg" },
      { id: 43, name: "Niverplast", logo: "https://www.hert.pl/media/logo/niverplast1.jpg" },
      { id: 44, name: "Panem", logo: "https://www.hert.pl/media/logo/panem.jpg" },
      { id: 45, name: "Rademaker", logo: "https://www.hert.pl/media/iopt/logo/radameker2.jpg" },  // poprawione z radamaker
      { id: 46, name: "Rheon", logo: "https://www.hert.pl/media/logo/rheon.jpg" },
      { id: 47, name: "Rilling", logo: "https://www.hert.pl/media/logo/rilling.jpg" },
      { id: 48, name: "Roboqbo", logo: "https://www.hert.pl/media/logo/roboqbo1.jpg" },
      { id: 49, name: "Sanomat", logo: "https://www.hert.pl/media/logo/sanomat1.jpg" },
      { id: 50, name: "Schomaker", logo: "https://www.hert.pl/media/logo/schomaker.jpg" },
      { id: 51, name: "Shuffle-Mix", logo: "https://www.hert.pl/media/logo/shufflemix.jpg" },
      { id: 52, name: "Unifiller", logo: "https://www.hert.pl/media/logo/unifiller.jpg" },
      { id: 53, name: "Unimac-Gherri", logo: "https://www.hert.pl/media/logo/unimac_gherri.jpg" },
      { id: 54, name: "Varimixer", logo: "https://www.hert.pl/media/logo/varimixer.jpg" },
      { id: 55, name: "Weisse", logo: "https://www.hert.pl/media/logo/weisse.jpg" },
      { id: 56, name: "Werner & Pfleiderer", logo: "https://www.hert.pl/media/logo/werner.jpg" },
      { id: 57, name: "Whirlpool", logo: "https://www.hert.pl/media/logo/whirlpooll.jpg" },   // poprawione z whirlpooll
      { id: 58, name: "WP Haton", logo: "https://www.hert.pl/media/logo/haton.jpg" },
      { id: 59, name: "WP Kemper", logo: "https://www.hert.pl/media/logo/wp_kemper.jpg" },
      { id: 60, name: "WP Riehle", logo: "https://www.hert.pl/media/logo/wp_riehle.jpg" },
      { id: 61, name: "Zacmi", logo: "https://www.hert.pl/media/logo/zacmi.jpg" },
      { id: 62, name: "Zeppelin", logo: "https://www.hert.pl/media/logo/zep_log.jpg" }
    ];

  brands = brands.map((e: any) => {
    e.link = createSlug(e.name);
    return e;
  })

  let isLoading = false;
  return (
    <Carousel<Brand>
      title="Strefa marek"
      items={brands}
      renderItem={BrandItem}
      isLoading={isLoading}
      skeletonCount={8}
      showViewAll={false}
    />
  );
}
