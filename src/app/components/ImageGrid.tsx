import Image from "next/image";

/**
 * ImageGrid — repeating mosaic of /extra-refraction.png
 *
 * Desktop: fills the right half of the viewport (3 × 3 tiles).
 * Tablet / mobile banner: full-width strip.
 */
export default function ImageGrid() {
  const tiles = Array.from({ length: 9 });

  return (
    <div className="grid grid-cols-3 w-full h-full overflow-hidden">
      {tiles.map((_, i) => (
        <div key={i} className="relative overflow-hidden aspect-square">
          <Image
            src="/extra-refraction.png"
            alt=""
            fill
            sizes="(max-width: 1024px) 33vw, 18vw"
            className="object-cover"
            priority={i < 3}
          />
        </div>
      ))}
    </div>
  );
}

