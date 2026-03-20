import Image from 'next/image'

export default function CTASections() {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 py-6">

      {/* LEFT / SHOWROOM */}
      <div className="relative md:col-span-2 aspect-[16/9] md:aspect-auto md:h-[420px] overflow-hidden rounded-lg">
        <Image
          src="https://www.hert.pl/devback/new/img/showroom.webp"
          alt="Showroom"
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          loading="lazy"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white max-w-lg">
          <h3 className="text-2xl md:text-3xl font-semibold mb-3">
            Showroom
          </h3>
          <p className="text-sm md:text-base leading-relaxed mb-5 text-white/90">
            Zanim zainwestujesz – upewnij się i sprawdź
            <br />
            maszyny w naszej testowej piekarni.
          </p>

          <a href="/showroom/"
            className="inline-block bg-hert hover:bg-hhert transition px-6 py-2.5 rounded-md font-medium"
          >
            Zobacz
          </a>
        </div>
      </div>

      {/* RIGHT / PROJEKTOWANIE */}
      <div className="relative aspect-[3/4] md:aspect-auto md:h-[420px] overflow-hidden rounded-lg">
        <Image
          src="https://www.hert.pl/devback/new/img/projektowanie_sklepow.webp"
          alt="Projektowanie sklepów"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          loading="lazy"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute bottom-0 left-0 p-6 md:p-7 text-white">
          <h3 className="text-xl md:text-2xl font-semibold mb-3">
            Projektowanie sklepów
          </h3>
          <p className="text-sm leading-relaxed mb-5 text-white/90">
            Nasi specjaliści zaprojektują dla Ciebie funkcjonalny i pięknie
            zaaranżowany sklep, który sprzedaje.
          </p>

          <a href="/zaprojektuj-swoj-sklep"
            className="inline-block bg-hert hover:bg-hhert transition px-6 py-2.5 rounded-md font-medium"
          >
            Skontaktuj się
          </a>
        </div>
      </div >

    </div >
  )
}