import Image from 'next/image';

export default function Features() {
  const features = [
    {
      icon: '/icons/przedstawiciele.svg',
      title: 'Przedstawiciele handlowi',
      subtitle: "",
      description: 'Skorzystaj z doradztwa oraz zdobytego doświadczenia.',
      link: 'SPRAWDŹ'
    },
    {
      icon: '/icons/gear.svg',
      title: 'Projekty przemysłowe',
      subtitle: "",

      description: 'Nasze wsparcie przy dużych projektach.',
      link: 'SPRAWDŹ'
    },
    {
      icon: '/icons/serwis.svg',
      subtitle: "",
      title: 'Serwis',
      description: 'Możesz na nas liczyć w każdym momencie.',
      link: 'SPRAWDŹ'
    },
    {
      icon: '/icons/bulb.svg',
      subtitle: "",
      title: 'Porady i inspiracje',
      description: 'Sprawdź jak możemy Ci pomóc i zainspirować.',
      link: 'SPRAWDŹ'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 py-6 ">
      {features.map((feature, idx) => (
        <div key={idx} className="bg-hertwhite  items-center gap-4 pr-4 px-1 py-4 rounded-lg shadow-sm  hover:shadow-lg transition flex ">

          <Image
            src={feature.icon || "/placeholder.svg"}
            alt={feature.title}
            width={90}
            height={90}
            className="w-[90px] h-[90px]"
          />

          <div>  <h3 className="font-bold text-base mb-1 text-gray-900">{feature.title}</h3>
            {feature.subtitle && (
              <p className="text-xs text-gray-600 mb-2">{feature.subtitle}</p>
            )}
            <p className="text-gray-600 text-xs mb-4 leading-relaxed">{feature.description}</p>
            <a href="#" className="text-hcar font-bold text-xs hover:text-purple-700 inline-block">
              {feature.link} →
            </a></div>
        </div>
      ))}
    </div>
  );
}
