// components/CategoryCards.tsx
import Image from 'next/image';

interface CategoryCard {
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  backgroundColor: string;
  href: string;
  className: string;
}

const categories: CategoryCard[] = [
  {
    title: 'Akcesoria piekarnicze',
    subtitle: 'i cukiernicze',
    description: 'Tylko sprawdzeni producenci w ofercie HERT.',
    imageUrl: '/images/akcesoria piekarnicze.webp',
    backgroundColor: '#d6b17b',
    href: '/akcesoria-piekarnicze',
    className: 'ap'
  },
  {
    title: 'Części zamienne do',
    subtitle: 'urządzeń',
    description: 'Tylko sprawdzeni producenci w ofercie HERT.',
    imageUrl: '/images/czesci zamienne.webp',
    backgroundColor: '#c3d4dc',
    href: '/czesci-zamienne',
    className: 'czz'
  }
];

export default function CategoryCards() {
  if (!categories) {
    return null;
  }
  return (
    <section className="max-w-7xl mx-auto px-0 ">
      <div className="flex gap-5 flex-col md:flex-row">
        {categories.map((category) => (
          <article
            key={category.className}
            className="relative w-full md:w-1/2 rounded-sm overflow-hidden h-[365px] md:h-[571px]"
            style={{ backgroundColor: category.backgroundColor }}
          >
            {/* Obrazek jako next/image dla optymalizacji */}
            <Image
              src={category.imageUrl}
              alt={category.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain object-bottom"
              priority
            />

            {/* Treść */}
            <div className="relative z-10 flex flex-col justify-start p-6 md:p-12 h-full">
              <h3 className="font-bold text-xl md:text-2xl mb-3 text-[#141718]">
                {category.title}
                {category.subtitle && (
                  <>
                    <br />
                    {category.subtitle}
                  </>
                )}
              </h3>

              <p className="text-sm text-[#141718] mb-6">
                {category.description}
              </p>

              <a
                href={category.href}
                className="inline-block w-fit text-white bg-hert hover:bg-purple-800 px-8 py-2 rounded text-xs font-bold transition-colors"
              >
                Sprawdź
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}