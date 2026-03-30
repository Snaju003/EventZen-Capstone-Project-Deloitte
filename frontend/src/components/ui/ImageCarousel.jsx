import { useState, useMemo, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

const DEFAULT_PLACEHOLDER = "https://placehold.co/800x400/f1f5f9/94a3b8?text=No+Image";

export function ImageCarousel({ images, altPrefix = "Image", className = "", autoPlay = false }) {
    const validImages = useMemo(() => {
        if (!Array.isArray(images) || images.length === 0) return [];
        return images.filter((url) => typeof url === "string" && url.trim());
    }, [images]);

    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);
    const hasMultiple = validImages.length > 1;

    const goTo = useCallback(
        (nextIndex) => {
            const safeNext = ((nextIndex % validImages.length) + validImages.length) % validImages.length;
            setDirection(safeNext > current ? 1 : -1);
            setCurrent(safeNext);
        },
        [current, validImages.length],
    );

    // Auto-play
    useEffect(() => {
        if (!autoPlay || !hasMultiple) return;
        const timer = setInterval(() => goTo(current + 1), 5000);
        return () => clearInterval(timer);
    }, [autoPlay, hasMultiple, current, goTo]);

    if (validImages.length === 0) {
        return (
            <div className={`group relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 ${className}`}>
                <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ImageOff className="h-7 w-7" />
                    <span className="text-xs font-medium">No image available</span>
                </div>
            </div>
        );
    }

    const slideVariants = {
        enter: (dir) => ({
            x: dir > 0 ? "100%" : "-100%",
            opacity: 0.5,
            scale: 1.05,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (dir) => ({
            x: dir > 0 ? "-100%" : "100%",
            opacity: 0.5,
            scale: 0.95,
        }),
    };

    return (
        <div className={`group relative overflow-hidden rounded-xl ${className}`}>
            {/* Slides */}
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.img
                    key={current}
                    src={validImages[current]}
                    alt={`${altPrefix} ${current + 1}`}
                    loading="lazy"
                    decoding="async"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    onError={(event) => {
                        event.currentTarget.src = DEFAULT_PLACEHOLDER;
                    }}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </AnimatePresence>

            {/* Bottom gradient overlay for dots visibility */}
            {hasMultiple && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
            )}

            {/* Image count badge */}
            {hasMultiple && (
                <div className="absolute right-2 top-2 z-10 rounded-lg bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    {current + 1} / {validImages.length}
                </div>
            )}

            {hasMultiple && (
                <>
                    {/* Arrow buttons — visible on hover */}
                    <button
                        type="button"
                        onClick={() => goTo(current - 1)}
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/60 opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => goTo(current + 1)}
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/60 opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                        {validImages.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => goTo(index)}
                                className={`rounded-full transition-all duration-300 ${
                                    index === current
                                        ? "h-2 w-6 bg-white shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                                        : "h-2 w-2 bg-white/50 hover:bg-white/80"
                                }`}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
