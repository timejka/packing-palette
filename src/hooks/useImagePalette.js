import { useEffect, useState } from "react";
import { loadImageForExtraction, extractPalette } from "../lib/colorExtraction";

/**
 * Loads an image and extracts its dominant colors client-side.
 * Returns { status: 'loading' | 'ready' | 'error', palette: string[] }.
 */
export function useImagePalette(url, count = 4) {
  const [state, setState] = useState({ status: "loading", palette: [] });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", palette: [] });

    if (!url) {
      setState({ status: "error", palette: [] });
      return undefined;
    }

    loadImageForExtraction(url)
      .then((img) => {
        if (cancelled) return;
        try {
          const palette = extractPalette(img, count);
          setState({ status: palette.length ? "ready" : "error", palette });
        } catch {
          // Canvas can be tainted if the host didn't send permissive CORS headers.
          setState({ status: "error", palette: [] });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", palette: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [url, count]);

  return state;
}
