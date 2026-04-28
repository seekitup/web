import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { api } from "@/lib/api";
import type { MetadataResponseDto } from "@/types/api";

export function useExtractMetadata() {
  const inflightRef = useRef<Map<string, Promise<MetadataResponseDto>>>(
    new Map(),
  );
  const cacheRef = useRef<Map<string, MetadataResponseDto>>(new Map());

  return useMutation<MetadataResponseDto, unknown, string>({
    mutationFn: async (url) => {
      const cached = cacheRef.current.get(url);
      if (cached) return cached;
      const inflight = inflightRef.current.get(url);
      if (inflight) return inflight;
      const promise = api.links
        .extractMetadata(url)
        .then((res) => {
          cacheRef.current.set(url, res);
          return res;
        })
        .finally(() => {
          inflightRef.current.delete(url);
        });
      inflightRef.current.set(url, promise);
      return promise;
    },
  });
}
