"use client";

import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileAvatar({
  filename,
  preview,
  fallback,
  className,
  alt = "",
}: {
  filename: string | null;
  preview?: string;
  fallback: ReactNode;
  className?: string;
  alt?: string;
}) {
  const src =
    preview ??
    (filename
      ? `/api/me/picture?v=${encodeURIComponent(filename)}`
      : undefined);
  return (
    <Avatar className={className}>
      {src && <AvatarImage key={src} src={src} alt={alt} />}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}
