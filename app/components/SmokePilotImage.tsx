"use client";

import { useRef, useState } from "react";
import styles from "./SmokePilot.module.css";

interface SmokePilotImageProps {
  src: string;
  alt: string;
  loading?: "lazy" | "eager";
}

function athenaFallback(src: string) {
  if (!src.includes("r2.dev") && !src.includes("images.torontodispensaryhub.com")) return null;
  const filename = src.split("/").pop();
  return filename ? `https://athena-cannabis-images.vercel.app/products/${filename}` : null;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function SmokePilotImage({ src, alt, loading = "lazy" }: SmokePilotImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(!src);
  const attemptedFallback = useRef(false);

  if (failed) {
    return (
      <div className={styles.imageFallback} role="img" aria-label={`${alt} image unavailable`}>
        {initials(alt)}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      onError={() => {
        const fallback = athenaFallback(src);
        if (!attemptedFallback.current && fallback && fallback !== currentSrc) {
          attemptedFallback.current = true;
          setCurrentSrc(fallback);
          return;
        }
        setFailed(true);
      }}
    />
  );
}

