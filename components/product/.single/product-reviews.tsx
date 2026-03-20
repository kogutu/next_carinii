"use client"
import { Star, SlidersHorizontal, ImageIcon, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useMemo } from "react"
import { ImageLightbox, useLightbox } from "@/components/ui/image-lightbox"

interface ReviewImage {
  thumb: string
  full: string
  author: string
  caption?: string
}

interface Review {
  name: string
  city: string
  stars: string
  orate: string
  review: string
  oreview?: string | null
  created_at: string
  confirmed: boolean
  imgs?: ReviewImage[]
}

interface GoogleReview {
  user: string
  rating: number
  text: string
  comment?: string
  createdat: number
  img?: string[]
  user_profile_img: string
}

interface ProductReviewsProps {
  reviews: {
    count: number
    avg_stars: number
    imgs: ReviewImage[]
    revs: Review[]
  }
  google_reviews: any
}

export function ProductReviews({ reviews, google_reviews }: ProductReviewsProps) {
  const [showOnlyWithPhotos, setShowOnlyWithPhotos] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")
  const [reviewSource, setReviewSource] = useState<"all" | "store" | "google">("all")

  const { isOpen, images: lightboxImages, initialIndex, openLightbox, closeLightbox } = useLightbox()

  const starDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    reviews.revs?.forEach((review) => {
      const stars = Math.round(Number.parseFloat(review.stars))
      if (stars >= 1 && stars <= 5) {
        distribution[stars as keyof typeof distribution]++
      }
    })

    google_reviews?.reviews?.forEach((review: GoogleReview) => {
      const stars = Math.round(review.rating)
      if (stars >= 1 && stars <= 5) {
        distribution[stars as keyof typeof distribution]++
      }
    })

    return distribution
  }, [reviews.revs, google_reviews])

  const allReviews = useMemo(() => {
    const regularReviews = reviews.revs || []
    const googleReviews = google_reviews?.reviews || []

    const convertedGoogleReviews = googleReviews.map((gr: GoogleReview & { user_profile_url?: string }) => ({
      name: gr.user,
      city: "Google",
      stars: gr.rating.toString(),
      orate: gr.rating.toString(),
      review: gr.text,
      oreview: gr.comment || null,
      created_at: new Date(gr.createdat / 1000).toISOString(),
      confirmed: false,
      url_profil: gr.user_profile_url,
      imgs: gr.img?.map((imgUrl: string) => ({
        thumb: imgUrl,
        full: imgUrl,
        author: gr.user,
      })),
      isGoogleReview: true,
      user_profile_img: gr.user_profile_img,
    }))

    return [...regularReviews.map((r) => ({ ...r, isGoogleReview: false })), ...convertedGoogleReviews]
  }, [reviews.revs, google_reviews])

  const totalCount = allReviews.length
  const totalAvgStars = useMemo(() => {
    if (totalCount === 0) return 0
    const sum = allReviews.reduce((acc, review) => acc + Number.parseFloat(review.stars), 0)
    return sum / totalCount
  }, [allReviews, totalCount])

  const filteredAndSortedReviews = useMemo(() => {
    let filtered = allReviews

    if (showOnlyWithPhotos) {
      filtered = filtered.filter((review) => review.imgs && review.imgs.length > 0)
    }

    if (reviewSource === "store") {
      filtered = filtered.filter((review) => !review.isGoogleReview)
    } else if (reviewSource === "google") {
      filtered = filtered.filter((review) => review.isGoogleReview)
    }

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortBy === "newest" ? dateB - dateA : dateA - dateB
    })

    return sorted
  }, [allReviews, showOnlyWithPhotos, sortBy, reviewSource])

  const allImages = useMemo(() => {
    const regularImages = reviews.imgs || []
    const googleImages =
      google_reviews?.reviews?.flatMap(
        (gr: GoogleReview) =>
          gr.img?.map((imgUrl: string) => ({
            thumb: imgUrl,
            full: imgUrl,
            author: gr.user,
          })) || [],
      ) || []
    return [...regularImages, ...googleImages]
  }, [reviews.imgs, google_reviews])

  const lightboxFormattedImages = allImages.map((img) => ({
    src: img.full || img.thumb,
    alt: `Zdjęcie ${img.author}`,
    caption: img.author,
  }))

  const handleImageClick = (index: number) => {
    openLightbox(lightboxFormattedImages, index)
  }

  if (totalCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Opinie</h2>
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-lg text-muted-foreground mb-2">Brak opinii</p>
          <p className="text-base text-muted-foreground">
            Jeśli kupiłeś u nas produkty, dodaj opinię - będziemy niezmiernie wdzięczni!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-semibold text-foreground">Opinie</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(totalAvgStars) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-muted-foreground">({totalAvgStars.toFixed(1)})</p>
          <span className="text-sm font-medium text-foreground underline cursor-pointer hover:no-underline">
            {totalCount} {totalCount === 1 ? "opinia" : "opinii"}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 items-start">
        <div className="shrink-0 space-y-4">
          <p className="text-2xl font-semibold text-foreground">{totalAvgStars.toFixed(2)} z 5</p>
        </div>

        <div className="flex-1 space-y-3 w-full min-w-0">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starDistribution[star as keyof typeof starDistribution]
            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2">
                <p className="w-2 shrink-0 text-sm font-medium text-foreground">{star}</p>
                <Star className="h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400" />
                <div className="h-1.5 flex-1 rounded-full bg-muted max-w-xs">
                  <div className="h-1.5 rounded-full bg-yellow-400" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-12 shrink-0 text-right text-sm font-medium text-muted-foreground sm:w-auto sm:text-left">
                  {count} <span className="hidden sm:inline">{count === 1 ? "opinia" : "opinii"}</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {allImages && allImages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
            <span className="text-xl text-mpgreen">›</span> zdjęcia użytkowników:
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {allImages.map((img, idx) => (
              <button key={idx} onClick={() => handleImageClick(idx)} className="flex-shrink-0">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-md hover:shadow-lg">
                  <Image
                    src={img.thumb || "/placeholder.svg"}
                    alt={`Zdjęcie ${img.author}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap border-t pt-6">
        <h3 className="text-lg font-semibold text-foreground">Wszystkie opinie</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 border border-border rounded-md p-1">
            <Button
              variant={reviewSource === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setReviewSource("all")}
              className={reviewSource === "all" ? "bg-mpgreen hover:bg-mpgreenh h-8" : "h-8"}
            >
              Wszystkie
            </Button>
            <Button
              variant={reviewSource === "store" ? "default" : "ghost"}
              size="sm"
              onClick={() => setReviewSource("store")}
              className={reviewSource === "store" ? "bg-mpgreen hover:bg-mpgreenh h-8" : "h-8"}
            >
              Sklep
            </Button>
            <Button
              variant={reviewSource === "google" ? "default" : "ghost"}
              size="sm"
              onClick={() => setReviewSource("google")}
              className={reviewSource === "google" ? "bg-mpgreen hover:bg-mpgreenh h-8" : "h-8"}
            >
              Google
            </Button>
          </div>

          <Button
            variant={showOnlyWithPhotos ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyWithPhotos(!showOnlyWithPhotos)}
            className={showOnlyWithPhotos ? "bg-mpgreen hover:bg-mpgreenh" : ""}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Ze zdjęciami
          </Button>

          <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {sortBy === "newest" ? "Najnowsze" : "Najstarsze"}
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {filteredAndSortedReviews.map((review, idx) => (
          <div key={idx} className="py-6 gap-3 flex flex-col sm:flex-row sm:items-start">
            <div className="shrink-0 space-y-2 sm:w-48 md:w-72">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(Number.parseFloat(review.stars))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                      }`}
                  />
                ))}
              </div>

              <div className="space-y-0.5">
                {review.isGoogleReview && review.user_profile_img && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mb-2">
                    <Image
                      src={review.user_profile_img || "/placeholder.svg"}
                      alt={review.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="text-base font-semibold text-foreground">{review.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString("pl-PL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  • {review.city}
                </p>
              </div>

              {review.isGoogleReview && (
                <>
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Opinia Google</p>
                  </div>

                  <a
                    target="_blank"
                    href={review.url_profil}
                    className="flex underline text-mpgreenh text-xs"
                    rel="noreferrer"
                  >
                    zobacz
                  </a>
                </>
              )}

              {review.confirmed && (
                <div className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-5 w-5 text-mpgreen" />
                  <p className="text-sm font-medium text-foreground">Zakup potwierdzony</p>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4 min-w-0">
              {review.isGoogleReview ? (
                <>
                  {review.review && <p className="text-base text-muted-foreground leading-relaxed">{review.review}</p>}
                  {review.oreview && (
                    <div className="bg-muted/50 border-l-4 border-mpgreen pl-4 py-2">
                      <p className="text-sm font-semibold text-foreground mb-1">Odpowiedź sklepu:</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.oreview}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">Ocena produktu:</span>
                      <span className="text-sm font-semibold text-mpgreen">
                        {Number.parseFloat(review.stars).toFixed(1)}
                      </span>
                    </div>
                    {review.review && (
                      <p className="text-base text-muted-foreground leading-relaxed">{review.review}</p>
                    )}
                  </div>

                  {(review.orate || review.oreview) && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">Ocena obsługi zamówienia:</span>
                        <span className="text-sm font-semibold text-mpgreen">
                          {Number.parseFloat(review.orate).toFixed(1)}
                        </span>
                      </div>
                      {review.oreview && (
                        <p className="text-base text-muted-foreground leading-relaxed">{review.oreview}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {review.imgs && review.imgs.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {review.imgs.map((img, imgIdx) => {
                    const reviewImages = review.imgs!.map((i) => ({
                      src: i.full || i.thumb,
                      alt: `Zdjęcie ${i.author}`,
                      caption: i.author,
                    }))
                    return (
                      <button
                        key={imgIdx}
                        onClick={() => openLightbox(reviewImages, imgIdx)}
                        className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                      >
                        <Image
                          src={img.thumb || "/placeholder.svg"}
                          alt={`Zdjęcie ${img.author}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Lightbox */}
      <ImageLightbox images={lightboxImages} initialIndex={initialIndex} isOpen={isOpen} onClose={closeLightbox} />
    </div>
  )
}
