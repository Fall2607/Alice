"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_FACE_SCORE_THRESHOLD,
  extractFaceDescriptor,
  FACE_DETECTION_INPUT_SIZE,
} from "./faceRecognition";

interface CachedDescriptor {
  readonly descriptor: number[];
  readonly capturedAt: number;
}

export interface UsePreExtractedFaceOptions {
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
  readonly enabled: boolean;
  readonly inputSize?: number;
  readonly scoreThreshold?: number;
  readonly scanDelayMs?: number;
  readonly maxDescriptorAgeMs?: number;
}

export interface PreExtractedFaceState {
  readonly isFaceLocked: boolean;
  readonly consumeFreshDescriptor: () => number[] | null;
  readonly extractLiveDescriptor: () => Promise<number[] | null>;
  readonly clearPreExtractedFace: () => void;
}

/**
 * Menjalankan deteksi & ekstraksi descriptor wajah secara berkala di latar belakang
 * selama kamera aktif, sehingga klik tombol Absen dapat langsung mengirim descriptor
 * tanpa menunggu proses komputasi AI dari nol.
 */
export function usePreExtractedFace({
  videoRef,
  enabled,
  inputSize = FACE_DETECTION_INPUT_SIZE.MOBILE,
  scoreThreshold = DEFAULT_FACE_SCORE_THRESHOLD,
  scanDelayMs = 450,
  maxDescriptorAgeMs = 2200,
}: UsePreExtractedFaceOptions): PreExtractedFaceState {
  const [isFaceLocked, setIsFaceLocked] = useState(false);
  const latestCacheRef = useRef<CachedDescriptor | null>(null);
  const inFlightPromiseRef = useRef<Promise<number[] | null> | null>(null);

  const clearPreExtractedFace = useCallback(() => {
    latestCacheRef.current = null;
    inFlightPromiseRef.current = null;
    setIsFaceLocked(false);
  }, []);

  const consumeFreshDescriptor = useCallback((): number[] | null => {
    const cached = latestCacheRef.current;
    if (!cached) return null;

    const ageMs = Date.now() - cached.capturedAt;
    latestCacheRef.current = null;
    setIsFaceLocked(false);

    if (ageMs > maxDescriptorAgeMs) {
      return null;
    }
    return cached.descriptor;
  }, [maxDescriptorAgeMs]);

  const extractLiveDescriptor = useCallback(async (): Promise<number[] | null> => {
    if (inFlightPromiseRef.current) {
      const inFlightResult = await inFlightPromiseRef.current;
      if (inFlightResult) return inFlightResult;
    }

    const promise = extractFaceDescriptor(videoRef.current, {
      inputSize,
      scoreThreshold,
    }).finally(() => {
      if (inFlightPromiseRef.current === promise) {
        inFlightPromiseRef.current = null;
      }
    });

    inFlightPromiseRef.current = promise;
    return promise;
  }, [videoRef, inputSize, scoreThreshold]);

  useEffect(() => {
    if (!enabled) {
      setIsFaceLocked(false);
      return;
    }

    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const runBackgroundScan = async () => {
      if (cancelled) return;

      const isTabVisible =
        typeof document === "undefined" || document.visibilityState === "visible";

      if (isTabVisible && videoRef.current && videoRef.current.readyState >= 2) {
        try {
          if (!inFlightPromiseRef.current) {
            const scanPromise = extractFaceDescriptor(videoRef.current, {
              inputSize,
              scoreThreshold,
            }).finally(() => {
              if (inFlightPromiseRef.current === scanPromise) {
                inFlightPromiseRef.current = null;
              }
            });
            inFlightPromiseRef.current = scanPromise;
          }

          const descriptor = await inFlightPromiseRef.current;
          if (cancelled) return;

          if (descriptor) {
            latestCacheRef.current = {
              descriptor,
              capturedAt: Date.now(),
            };
            setIsFaceLocked(true);
          } else {
            latestCacheRef.current = null;
            setIsFaceLocked(false);
          }
        } catch (err) {
          if (!cancelled) {
            console.warn("Background face pre-extract gagal:", err);
          }
        }
      }

      if (!cancelled) {
        timerId = setTimeout(runBackgroundScan, scanDelayMs);
      }
    };

    // Mulai iterasi pertama segera setelah kamera mengalirkan frame
    timerId = setTimeout(runBackgroundScan, 150);

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [enabled, videoRef, inputSize, scoreThreshold, scanDelayMs]);

  return {
    isFaceLocked,
    consumeFreshDescriptor,
    extractLiveDescriptor,
    clearPreExtractedFace,
  };
}

