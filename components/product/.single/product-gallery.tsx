"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductColorVariants } from "./product-color-variants"
import lgZoom from "lightgallery/plugins/zoom"
import lgThumbnail from "lightgallery/plugins/thumbnail"
import lightGallery from "lightgallery"
import type { LightGallery as LightGalleryType } from "lightgallery/lightgallery"

// Import lightGallery styles
import "lightgallery/css/lightgallery.css"
import "lightgallery/css/lg-zoom.css"
import "lightgallery/css/lg-thumbnail.css"

interface ProductGalleryProps {
  images: Array<{ url: string; alt: string; position: number }>
  isNew?: boolean
  model: string
  pid: number
  isPreSale?: boolean
  mainImage: string
  productName: string
}

export function ProductGallery({ images, isNew, isPreSale, mainImage, productName, model, pid }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [scrollPosition, setScrollPosition] = useState(0)
  const lightboxRef = useRef<HTMLDivElement>(null)
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)
  const lgInstance = useRef<LightGalleryType | null>(null)

  const allImages = images.length > 0 ? images : [{ url: mainImage, alt: productName, position: 1 }]

  useEffect(() => {
    if (lightboxRef.current && !lgInstance.current) {
      lgInstance.current = lightGallery(lightboxRef.current, {
        plugins: [lgZoom, lgThumbnail],
        speed: 500,
        licenseKey: "your_license_key",
        thumbnail: true,
        animateThumb: true,
        zoomFromOrigin: true,
        allowMediaOverlap: true,
        toggleThumb: true,
      })

      // Listen for slide changes in lightGallery
      lightboxRef.current.addEventListener("lgAfterSlide", (event: any) => {
        const { index } = event.detail
        setSelectedImage(index)
        scrollThumbnailToIndex(index)
      })
    }

    return () => {
      if (lgInstance.current) {
        lgInstance.current.destroy()
        lgInstance.current = null
      }
    }
  }, [])

  const scrollThumbnailToIndex = (index: number) => {
    if (!thumbnailContainerRef.current) return

    const container = thumbnailContainerRef.current
    const thumbnailWidth = container.scrollWidth / allImages.length
    const containerWidth = container.offsetWidth

    // Calculate position to center the selected thumbnail
    const scrollPosition = thumbnailWidth * index - containerWidth / 2 + thumbnailWidth / 2

    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: "smooth",
    })
  }

  const nextImage = () => {
    const newIndex = (selectedImage + 1) % allImages.length
    setSelectedImage(newIndex)
    scrollThumbnailToIndex(newIndex)
  }

  const prevImage = () => {
    const newIndex = (selectedImage - 1 + allImages.length) % allImages.length
    setSelectedImage(newIndex)
    scrollThumbnailToIndex(newIndex)
  }

  const scrollThumbnails = (direction: "left" | "right") => {
    if (!thumbnailContainerRef.current) return

    const container = thumbnailContainerRef.current
    const scrollAmount = container.offsetWidth * 0.75 // Scroll by 75% of container width

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  const handleThumbnailScroll = () => {
    if (thumbnailContainerRef.current) {
      setScrollPosition(thumbnailContainerRef.current.scrollLeft)
    }
  }

  const showLeftArrow = scrollPosition > 10
  const showRightArrow = thumbnailContainerRef.current
    ? scrollPosition < thumbnailContainerRef.current.scrollWidth - thumbnailContainerRef.current.offsetWidth - 10
    : true

  const handleMainImageClick = () => {
    if (lgInstance.current) {
      lgInstance.current.openGallery(selectedImage)
    }
  }

  const handleThumbnailClick = (idx: number) => {
    setSelectedImage(idx)
    scrollThumbnailToIndex(idx)
    if (lgInstance.current) {
      lgInstance.current.openGallery(idx)
    }
  }

  return (
    <div>
      {/* Main Image */}
      <div className="relative w-full aspect-[4/3] flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden group bg-[#f2f2f2] pb-6">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-1 flex flex-col gap-2">
          {isNew && <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1">NEW</Badge>}
          {isPreSale && (
            <Badge className="bg-mpgreen hover:bg-greenh text-white font-bold px-3 py-1">PRESALE!</Badge>
          )}
          <Badge className="bg-mpred hover:bg-green-600 text-white font-bold px-3 py-1">gwarancja: <br /> 60 msc</Badge>
        </div>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-mpgray hover:bg-636363 opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-12 h-12"
              onClick={prevImage}
            >
              <ChevronLeft className="h-10 w-10 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-mpgray hover:bg-636363 opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-12 h-12"
              onClick={nextImage}
            >
              <ChevronRight className="h-9 w-9 text-white" />
            </Button>
          </>
        )}

        <div className="relative w-full h-full cursor-zoom-in p-4" onClick={handleMainImageClick}>
          <Image
            src={allImages[selectedImage]?.url || "/placeholder.svg"}
            alt={allImages[selectedImage]?.alt || productName}
            fill
            className="object-cover img_bg"
            priority
          />
        </div>
      </div>

      {/* Hidden lightGallery elements */}
      <div ref={lightboxRef} className="hidden">
        {allImages.map((image, idx) => (
          <a key={idx} href={image.url} data-lg-size="1600-1200" data-sub-html={`<h4>${image.alt || productName}</h4>`}>
            <img src={image.url || "/placeholder.svg"} alt={image.alt} />
          </a>
        ))}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="relative -top-2 -mt-2  mb-10">
          {/* Desktop Grid - hidden on mobile */}
          <div className="hidden md:grid grid-cols-6 gap-2 ">
            {allImages.map((image, idx) => (
              <button
                key={idx}
                onClick={() => handleThumbnailClick(idx)}
                className={`relative aspect-[4/3] border border-mpwhite bg-muted rounded overflow-hidden cursor-pointer transition-all ${selectedImage === idx ? "border-b-4 border-gray-300 border-b-mpgreen" : "hover:border-b-4 hover:border-gray-300"
                  }`}
              >
                <Image src={image.url || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
              </button>
            ))}
          </div>

          <div className="md:hidden relative top-8 pl-3">
            {/* Left Arrow */}
            {showLeftArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md rounded-full w-8 h-8"
                onClick={() => scrollThumbnails("left")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            {/* Scrollable Container */}
            <div
              ref={thumbnailContainerRef}
              onScroll={handleThumbnailScroll}
              className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth px-1"
              style={{
                scrollSnapType: "x mandatory",
              }}
            >
              {allImages.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => handleThumbnailClick(idx)}
                  className={`relative aspect-[4/3] bg-muted rounded overflow-hidden cursor-pointer transition-all snap-start flex-shrink-0 ${selectedImage === idx ? "border-b-2 border-mpgreen" : "hover:border-b-2 hover:border-mpgreen"
                    }`}
                  style={{
                    width: "calc((100% - 0.5rem * 3.5) / 4.5)", // 4.5 items visible
                  }}
                >
                  <Image src={image.url || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Right Arrow */}
            {showRightArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md rounded-full w-8 h-8"
                onClick={() => scrollThumbnails("right")}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      )}


      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
