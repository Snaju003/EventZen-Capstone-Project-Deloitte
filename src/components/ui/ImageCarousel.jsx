import { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

const DEFAULT_PLACEHOLDER = "https://placehold.co/800x400/f1f5f9/94a3b8?text=No+Image";

export function ImageCarousel({ images, altPrefix = "Image", className = "" }) {
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

    if (validImages.length === 0) {
        return (
            <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-100 ${className}`}>
                <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ImageOff className="h-7 w-7" />
                    <span className="text-xs font-medium">No image available</span>
                </div>
            </div>
        );
    }

    const slideVariants = {
        enter: (dir) => ({
            x: dir > 0 ? 60 : -60,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir) => ({
            x: dir > 0 ? -60 : 60,
            opacity: 0,
        }),
    };

    return (
        <div className={`relative overflow-hidden rounded-xl ${className}`}>
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
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    onError={(event) => {
                        event.currentTarget.src = DEFAULT_PLACEHOLDER;
                    }}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </AnimatePresence>

            {hasMultiple ? (
                <>
                    <button
                        type="button"
                        onClick={() => goTo(current - 1)}
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow-sm backdrop-blur transition-all hover:bg-white"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => goTo(current + 1)}
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow-sm backdrop-blur transition-all hover:bg-white"
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                        {validImages.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => goTo(index)}
                                className={`h-1.5 rounded-full transition-all ${index === current ? "w-5 bg-white" : "w-1.5 bg-white/60"}`}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
}
