"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Review, ReviewsResponse } from "@/lib/typesense";

interface ProductReviewsProps {
  productSku: string;
  productBasename: string;
  averageRating?: number;
  reviewCount?: number;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

function RatingBreakdown({
  facets,
  total
}: {
  facets?: { rating?: { value: string; count: number }[] };
  total: number;
}) {
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => {
    const found = facets?.rating?.find((r) => r.value === String(rating));
    return { rating, count: found?.count || 0 };
  });

  return (
    <div className="space-y-2">
      {ratingCounts.map(({ rating, count }) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={rating} className="flex items-center gap-2 text-sm">
            <span className="w-3 text-muted-foreground">{rating}</span>
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-right text-muted-foreground text-xs">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.date_created * 1000);
  const formattedDate = date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{review.author_name}</span>
                {review.verified_purchase && (
                  <Badge variant="secondary" className="text-xs gap-1 py-0">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Zweryfikowany zakup
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
      </CardContent>
    </Card>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ProductReviews({ productSku, productBasename, averageRating = 0, reviewCount = 0 }: ProductReviewsProps) {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/reviews?sku=${encodeURIComponent(productSku)}&base=${encodeURIComponent(productBasename)}&page=${currentPage}&perPage=${perPage}`
        );
        if (response.ok) {
          const data = await response.json();
          setReviewsData(data);
        }
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [productSku, currentPage]);

  return (
    <section className="border-t border-border pt-8 mt-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Summary */}
        <div className="lg:w-72 shrink-0">
          <h2 className="text-xl font-semibold mb-4">Opinie klientów</h2>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 5</span>
          </div>
          <StarRating rating={Math.round(averageRating)} size="lg" />
          <p className="text-sm text-muted-foreground mt-2">
            Na podstawie {reviewCount} {reviewCount === 1 ? "opinii" : reviewCount < 5 ? "opinii" : "opinii"}
          </p>

          {reviewsData?.facets && (
            <div className="mt-6">
              <RatingBreakdown facets={reviewsData.facets} total={reviewsData.total} />
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <ReviewsSkeleton />
          ) : reviewsData && reviewsData.reviews.length > 0 ? (
            <>
              <div className="space-y-4">
                {reviewsData.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {/* Pagination */}
              {reviewsData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Poprzednia
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">
                    Strona {currentPage} z {reviewsData.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(reviewsData.totalPages, p + 1))}
                    disabled={currentPage === reviewsData.totalPages}
                  >
                    Następna
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Ten produkt nie ma jeszcze opinii.</p>
              <p className="text-sm mt-1">Bądź pierwszy i podziel się swoją opinią!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
