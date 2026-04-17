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
    <section className="border-y border-gray-200 bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="shrink-0">
                <badge.icon className="h-8 w-8 text-gray-700" />
              </div>
              <div className="font-medium text-gray-900">{badge.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
