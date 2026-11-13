import { useState } from "react";

const HotelCardImage = ({ src, alt, className = "" }) => {
  const [failedSrc, setFailedSrc] = useState("");
  const imageUrl = typeof src === "string" ? src.trim() : "";

  if (!imageUrl || failedSrc === imageUrl) {
    return (
      <div
        role="img"
        aria-label={`${alt || "Hotel"} image unavailable`}
        className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm text-slate-500 ${className}`}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(imageUrl)}
      className={className}
    />
  );
};

export default HotelCardImage;
