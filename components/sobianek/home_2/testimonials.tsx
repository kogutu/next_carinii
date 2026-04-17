import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Adam Kowalski",
      company: "Nazwa firmy, Stanowisko",
      rating: 5,
      text: "Treść opinii lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.",
    },
    {
      name: "Beata Nowicka",
      company: "Nazwa firmy, Stanowisko",
      rating: 5,
      text: "Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.",
    },
    {
      name: "Łukasz Nowicki",
      company: "Nazwa firmy, Stanowisko",
      rating: 5,
      text: "Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Treść opinii lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. S",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-start justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Ponad 1 210 pozytywnych opinii</h2>
            <p className="text-gray-600">Zobacz co myślą o nas nasi klienci.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-secondary text-secondary" />
              ))}
            </div>
            <span className="font-bold text-lg">Ocena 4,9</span>
            <span className="text-gray-600">na Google</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-gray-900 text-gray-900" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">{testimonial.text}</p>
              <div className="border-t border-gray-200 pt-4">
                <div className="font-bold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
