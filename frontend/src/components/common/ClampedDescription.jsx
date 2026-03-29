import { useEffect, useRef, useState } from "react";

export function ClampedDescription({
  text,
  actionLabel,
  className = "",
  maxLines = 3,
  onAction,
}) {
  const content = (text || "").trim();
  const description = content || "No description available.";
  const paragraphRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const measureOverflow = () => {
      const element = paragraphRef.current;
      if (!element || !content) {
        setIsOverflowing(false);
        return;
      }

      setIsOverflowing(element.scrollHeight - element.clientHeight > 1);
    };

    measureOverflow();
    window.addEventListener("resize", measureOverflow);
    return () => {
      window.removeEventListener("resize", measureOverflow);
    };
  }, [content, maxLines]);

  return (
    <div>
      <p
        ref={paragraphRef}
        className={className}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {description}
      </p>
      {isOverflowing ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
