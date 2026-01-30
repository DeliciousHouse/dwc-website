import Image, { type ImageProps } from "next/image";
import { getSiteImage, type SiteImageId } from "@/assets/siteImages";
import { cn } from "@/lib/utils";

type SiteImageProps = {
  id: SiteImageId;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
} & Omit<ImageProps, "src" | "alt" | "width" | "height" | "priority" | "sizes" | "fill">;

export function SiteImage({ id, className, priority, sizes, fill, ...rest }: SiteImageProps) {
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

type AppImageFillProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill: true;
} & Omit<ImageProps, "src" | "alt" | "width" | "height" | "priority" | "sizes" | "fill">;

type AppImageFixedProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: false;
  width: number;
  height: number;
} & Omit<ImageProps, "src" | "alt" | "priority" | "sizes" | "fill" | "width" | "height">;

export type AppImageProps = AppImageFillProps | AppImageFixedProps;

/**
 * Centralized wrapper around `next/image`.
 * Use this for dynamic (e.g. product) imagery so we keep `next/image` imports confined to one module.
 */
export function AppImage({ className, priority, sizes, ...rest }: AppImageProps) {
  if ("fill" in rest && rest.fill) {
    const { src, alt, fill, ...imgRest } = rest;
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", className)}
        {...imgRest}
      />
    );
  }

  const { src, alt, width, height, ...imgRest } = rest as AppImageFixedProps;
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={cn("h-auto w-full", className)}
      {...imgRest}
    />
  );
}
