"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import ReviewItem from "./review-item"

const INITIAL_COUNT = 6
const LOAD_MORE_COUNT = 6

export function Testimonials({ reviews }: { reviews: any[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)
  const hasMore = visibleCount < reviews.length

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Ponad 1 210 pozytywnych opinii</h2>
            <p className="text-gray-600 text-sm sm:text-base">Zobacz co myślą o nas nasi klienci.</p>
          </div>
          <div className="flex justify-end flex-wrap items-center gap-2 shrink-0">
            <div>
              <svg width="34px" height="34px" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"></path><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"></path><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"></path><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"></path></g></svg>
            </div>
            <div className="flex gap-0.5 sm:gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 sm:h-5  sm:w-5 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <span className="font-bold text-base sm:text-lg text-right w-full">Ocena 4,7</span>

          </div>
        </div>
        {/* nagłówek bez zmian */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* ... */}
        </div>

        <div className="grid sm:grid-cols-4 md:grid-cols-4 gap-4 sm:gap-6">
          {reviews.slice(0, visibleCount).map((review, index) => (
            <ReviewItem key={index} review={review} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Zobacz więcej
          </button>
        </div>

      </div>
    </section>
  )
}