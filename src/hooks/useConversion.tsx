import { useState, useCallback } from "react";
import { Command } from "@tauri-apps/plugin-shell";
import { save } from "@tauri-apps/plugin-dialog";
import type { ConversionResult } from "../types";

export const useConversion = () => {
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const convertToWebP = async (file: File) => {
    const originalName = file.name;

    setResults((prev) => [
      ...prev,
      { original: originalName, output: "", status: "converting" },
    ]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const { appCacheDir } = await import("@tauri-apps/api/path");
      const tempDir = await appCacheDir();
      const tempInputPath = `${tempDir}/input_${Date.now()}_${file.name}`;

      const { exists, mkdir, writeFile } = await import("@tauri-apps/plugin-fs");
      const dirExists = await exists(tempDir);
      if (!dirExists) {
        await mkdir(tempDir, { recursive: true });
      }

      await writeFile(tempInputPath, uint8Array);

      const outputPath = await save({
        defaultPath: file.name.replace(/\.[^/.]+$/, ".webp"),
        filters: [
          {
            name: "WebP Image",
            extensions: ["webp"],
          },
        ],
      });

      if (!outputPath) {
        setResults((prev) =>
          prev.map((r) =>
            r.original === originalName
              ? { ...r, status: "error", message: "Cancelled by user" }
              : r
          )
        );
        return;
      }

      const command = Command.sidecar("binaries/cwebp", [
        tempInputPath,
        "-o",
        outputPath,
      ]);

      const startTime = Date.now();
      const output = await command.execute();
      const endTime = Date.now();
      const conversionTime = ((endTime - startTime) / 1000).toFixed(2);

      if (output.code === 0) {
        setResults((prev) =>
          prev.map((r) =>
            r.original === originalName
              ? {
                  ...r,
                  output: outputPath,
                  status: "success",
                  message: `Converted successfully in ${conversionTime}s`,
                  conversionTime: parseFloat(conversionTime),
                }
              : r
          )
        );
      } else {
        setResults((prev) =>
          prev.map((r) =>
            r.original === originalName
              ? {
                  ...r,
                  status: "error",
                  message: output.stderr || "Conversion failed",
                }
              : r
          )
        );
      }

      const { remove } = await import("@tauri-apps/plugin-fs");
      await remove(tempInputPath).catch(() => {});
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : JSON.stringify(error);

      setResults((prev) =>
        prev.map((r) =>
          r.original === originalName
            ? {
                ...r,
                status: "error",
                message: `Error: ${errorMessage}`,
              }
            : r
        )
      );
    }
  };

  const convertFiles = useCallback(async (files: File[]) => {
    setIsConverting(true);
    for (const file of files) {
      await convertToWebP(file);
    }
    setIsConverting(false);
  }, []);

  const clearResults = () => setResults([]);

  return {
    results,
    isConverting,
    setIsConverting,
    convertFiles,
    clearResults,
  };
};
