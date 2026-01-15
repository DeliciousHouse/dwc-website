import Image, { type ImageProps } from "next/image";
import { getSiteImage, type SiteImageId } from "@/assets/siteImages";
import { cn } from "@/lib/utils";

type Props = {
  id: SiteImageId;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
} & Omit<ImageProps, "src" | "alt" | "width" | "height" | "priority" | "sizes" | "fill">;

export function SiteImage({ id, className, priority, sizes, fill, ...rest }: Props) {
  const img = getSiteImage(id);
  const objectPosition = img.focalPoint ? `${img.focalPoint.x * 100}% ${img.focalPoint.y * 100}%` : undefined;

  if (fill) {
    return (
      <Image
        src={img.localPath}
        alt={img.alt}
        fill
        priority={priority}
        sizes={sizes}
        {...rest}
        className={cn("object-cover", className)}
        style={{ ...rest.style, objectPosition }}
      />
    );
  }

  return (
    <Image
      src={img.localPath}
      alt={img.alt}
      width={img.width}
      height={img.height}
      priority={priority}
      sizes={sizes}
      className={cn("h-auto w-full", className)}
      {...rest}
    />
  );
}

