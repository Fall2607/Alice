export type FaceApiModule = typeof import("@vladmandic/face-api");

const MODEL_URL = "/models";

export const FACE_DETECTION_INPUT_SIZE = {
  MOBILE: 224,
  KIOSK: 320,
} as const;

export const DEFAULT_FACE_SCORE_THRESHOLD = 0.45;

export const CAMERA_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 640 },
  height: { ideal: 480 },
  facingMode: "user",
};

export interface FaceExtractionOptions {
  readonly inputSize?: number;
  readonly scoreThreshold?: number;
}

let modelLoadPromise: Promise<FaceApiModule> | null = null;
let isDetectorWarmedUp = false;

/**
 * Menjalankan 1x inferensi ringan pada canvas kosong untuk memicu
 * kompilasi shader WebGL lebih awal sebelum kamera aktif digunakan.
 */
async function warmUpDetector(
  faceapi: FaceApiModule,
  inputSize: number
): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    const warmCanvas = document.createElement("canvas");
    warmCanvas.width = inputSize;
    warmCanvas.height = inputSize;
    await faceapi.detectSingleFace(
      warmCanvas,
      new faceapi.TinyFaceDetectorOptions({
        inputSize,
        scoreThreshold: DEFAULT_FACE_SCORE_THRESHOLD,
      })
    );
  } catch (err) {
    console.warn("Warm-up shader detektor wajah dilewati:", err);
  }
}

/**
 * Memuat modul dan model AI wajah hanya sekali per sesi browser (singleton cache).
 */
export async function ensureFaceModelsLoaded(
  warmUpInputSize: number = FACE_DETECTION_INPUT_SIZE.MOBILE
): Promise<FaceApiModule> {
  if (!modelLoadPromise) {
    modelLoadPromise = (async () => {
      const faceapi = await import("@vladmandic/face-api");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      if (!isDetectorWarmedUp) {
        isDetectorWarmedUp = true;
        await warmUpDetector(faceapi, warmUpInputSize);
      }

      return faceapi;
    })().catch((err) => {
      // Reset agar percobaan berikutnya bisa mengunduh ulang bila koneksi sempat putus.
      modelLoadPromise = null;
      throw err;
    });
  }

  return modelLoadPromise;
}

/**
 * Memulai preload model AI di latar belakang tanpa memblokir UI.
 */
export function preloadFaceModels(
  warmUpInputSize: number = FACE_DETECTION_INPUT_SIZE.MOBILE
): void {
  if (typeof window === "undefined") return;
  ensureFaceModelsLoaded(warmUpInputSize).catch((err) => {
    console.warn("Preload model wajah di latar belakang gagal:", err);
  });
}

/**
 * Mengekstrak descriptor wajah 128 dimensi dari elemen video aktif.
 */
export async function extractFaceDescriptor(
  videoElement: HTMLVideoElement | null,
  options: FaceExtractionOptions = {}
): Promise<number[] | null> {
  if (
    !videoElement ||
    videoElement.readyState < 2 ||
    videoElement.videoWidth === 0 ||
    videoElement.paused
  ) {
    return null;
  }

  const inputSize = options.inputSize ?? FACE_DETECTION_INPUT_SIZE.MOBILE;
  const scoreThreshold = options.scoreThreshold ?? DEFAULT_FACE_SCORE_THRESHOLD;
  const faceapi = await ensureFaceModelsLoaded(inputSize);

  const detection = await faceapi
    .detectSingleFace(
      videoElement,
      new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  return Array.from(detection.descriptor);
}

