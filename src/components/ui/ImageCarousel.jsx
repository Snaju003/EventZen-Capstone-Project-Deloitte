import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

export function ImageCarousel({ images, altPrefix = "Image", className = "" }) {
  const safeImages = useMemo(() => {
    return Array.isArray(images)
      ? images.filter((url) => typeof url === "string" && url.trim())
      : [];
  }, [images]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [safeImages.length]);

  if (!safeImages.length) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 ${className}`}>
        <div className="flex items-center gap-2 text-sm font-medium">
          <ImageIcon className="h-4 w-4" />
          No image available
        </div>
      </div>
    );
  }

  const showControls = safeImages.length > 1;

  const goPrevious = () => {
    setActiveIndex((previous) => (previous - 1 + safeImages.length) % safeImages.length);
  };

  const goNext = () => {
    setActiveIndex((previous) => (previous + 1) % safeImages.length);
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-100 ${className}`}>
      <img
        src={safeImages[activeIndex]}
        alt={`${altPrefix} ${activeIndex + 1}`}
        className="h-full w-full object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {showControls ? (
        <>
          <button
            type="button"
            onClick={goPrevious}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2 py-1">
            {safeImages.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  index === activeIndex ? "bg-white" : "bg-white/45"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
