import { useEffect } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { getMimeType } from "../utils/fileUtils";

export const useDragDrop = (
  onFilesDropped: (files: File[]) => void,
  setIsConverting: (isConverting: boolean) => void
) => {
  useEffect(() => {
    let unlisten: (() => void) | null = null;
    const processedEventIds = new Set<number>();
    let processingPromise: Promise<void> | null = null;
    let cleanupTimeout: NodeJS.Timeout | null = null;

    const setupDragDrop = async () => {
      const webview = getCurrentWebview();
      unlisten = await webview.onDragDropEvent(async (event) => {
        if (event.payload.type === "drop") {
          if (processedEventIds.has(event.id)) {
            return;
          }

          processedEventIds.add(event.id);

          if (processingPromise) {
            return;
          }

          if (cleanupTimeout) clearTimeout(cleanupTimeout);
          cleanupTimeout = setTimeout(() => {
            processedEventIds.clear();
          }, 1000);

          const paths = event.payload.paths as string[];

          processingPromise = (async () => {
            setIsConverting(true);

            const files: File[] = [];
            for (const path of paths) {
              try {
                const { readFile } = await import("@tauri-apps/plugin-fs");
                const fileData = await readFile(path);

                const fileName = path.split(/[\\/]/).pop() || "unknown";

                const blob = new Blob([fileData]);
                const file = new File([blob], fileName, {
                  type: getMimeType(fileName),
                });

                files.push(file);
              } catch (error) {
              }
            }

            if (files.length > 0) {
              onFilesDropped(files);
            }

            setIsConverting(false);
          })();

          await processingPromise;
          processingPromise = null;
        }
      });
    };

    setupDragDrop();

    return () => {
      if (unlisten) {
        unlisten();
      }
      if (cleanupTimeout) clearTimeout(cleanupTimeout);
    };
  }, [onFilesDropped, setIsConverting]);
};
