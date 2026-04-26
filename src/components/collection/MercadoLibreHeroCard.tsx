import { useState } from "react";
import type { FileResponseDto } from "@/types/api";

interface MercadoLibreHeroCardProps {
  mediaFiles: FileResponseDto[];
}

export function MercadoLibreHeroCard({
  mediaFiles,
}: MercadoLibreHeroCardProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const imageFiles = mediaFiles.filter(
    (f) => f.purpose === "image" || f.purpose === "og_image",
  );

  const primaryImage = imageFiles[0];
  const secondaryImages = imageFiles.slice(1, 4);

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  return (
    <div className="bg-white overflow-hidden rounded-xl pt-3.5 pb-1.5 px-1.5 flex flex-col">
      {/* MercadoLibre Logo */}
      <img
        src="/mercadolibre-logo.png"
        alt="MercadoLibre"
        className="h-6 w-auto object-contain self-start ml-1 mb-3"
      />

      {/* Image Grid */}
      <div className="flex gap-1.5 flex-1 min-h-0">
        {/* Left: Primary Image */}
        {primaryImage ? (
          <div className="flex-[65] relative rounded-lg overflow-hidden">
            {!loadedImages.has(primaryImage.id) && (
              <div className="absolute inset-0 animate-pulse bg-neutral-200" />
            )}
            <img
              src={primaryImage.url}
              alt=""
              loading="lazy"
              onLoad={() => handleImageLoad(primaryImage.id)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                loadedImages.has(primaryImage.id) ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        ) : (
          <div className="flex-[65] rounded-lg bg-neutral-100" />
        )}

        {/* Right: Secondary Images Column */}
        {secondaryImages.length > 0 && (
          <div className="flex-[35] flex flex-col gap-1.5">
            {secondaryImages.map((file) => (
              <div
                key={file.id}
                className="flex-1 relative rounded-lg overflow-hidden"
              >
                {!loadedImages.has(file.id) && (
                  <div className="absolute inset-0 animate-pulse bg-neutral-200" />
                )}
                <img
                  src={file.url}
                  alt=""
                  loading="lazy"
                  onLoad={() => handleImageLoad(file.id)}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    loadedImages.has(file.id) ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
