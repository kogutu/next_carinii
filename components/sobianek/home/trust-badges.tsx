import { CreditCard, Truck, Star, Award } from "lucide-react"

export function TrustBadges() {
  const badges = [
    {
      icon: CreditCard,
      title: "Bezpieczna płatność",
    },
    {
      icon: Truck,
      title: "Szybka dostawa",
    },
    {
      icon: Star,
      title: "Materiały wysokiej jakości",
    },
    {
      icon: Award,
      title: "30 lat doświadczenia",
    },
  ]

  return (
    <section className="border-y border-gray-200 bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="shrink-0">
                <badge.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gray-700" />
              </div>
              <div className="font-medium text-xs sm:text-sm md:text-base text-gray-900">{badge.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
