import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Command } from "@tauri-apps/plugin-shell";
import { save } from "@tauri-apps/plugin-dialog";
import { getVersion } from "@tauri-apps/api/app";
import "./App.css";

interface ConversionResult {
  original: string;
  output: string;
  status: "success" | "error" | "converting";
  message?: string;
}

function App() {
  const [quality, setQuality] = useState(80);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  const convertToWebP = async (file: File) => {
    const originalName = file.name;
    console.log(`[${originalName}] Starting conversion...`);

    setResults((prev) => [
      ...prev,
      { original: originalName, output: "", status: "converting" },
    ]);

    try {
      // Read file as array buffer
      console.log(`[${originalName}] Reading file...`);
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log(`[${originalName}] File read: ${uint8Array.length} bytes`);

      // Create temporary file path
      console.log(`[${originalName}] Getting app cache directory...`);
      const { appCacheDir } = await import("@tauri-apps/api/path");
      const tempDir = await appCacheDir();
      const tempInputPath = `${tempDir}/input_${Date.now()}_${file.name}`;
      console.log(`[${originalName}] Temp path: ${tempInputPath}`);

      // Create cache directory if it doesn't exist
      console.log(`[${originalName}] Ensuring cache directory exists...`);
      const { exists, mkdir, writeFile } = await import("@tauri-apps/plugin-fs");
      const dirExists = await exists(tempDir);
      if (!dirExists) {
        console.log(`[${originalName}] Creating cache directory: ${tempDir}`);
        await mkdir(tempDir, { recursive: true });
      }

      // Write input file
      console.log(`[${originalName}] Writing temp file...`);
      await writeFile(tempInputPath, uint8Array);
      console.log(`[${originalName}] Temp file written successfully`);

      // Ask user where to save
      console.log(`[${originalName}] Opening save dialog...`);
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
        console.log(`[${originalName}] User cancelled`);
        setResults((prev) =>
          prev.map((r) =>
            r.original === originalName
              ? { ...r, status: "error", message: "Cancelled by user" }
              : r
          )
        );
        return;
      }
      console.log(`[${originalName}] Output path: ${outputPath}`);

      // Execute cwebp command using sidecar
      console.log(`[${originalName}] Executing cwebp command...`);
      console.log(`[${originalName}] Command: binaries/cwebp`);
      console.log(`[${originalName}] Args:`, [tempInputPath, "-o", outputPath]);

      const command = Command.sidecar("binaries/cwebp", [
        tempInputPath,
        "-o",
        outputPath,
      ]);

      console.log(`[${originalName}] Running command...`);
      const output = await command.execute();
      console.log(`[${originalName}] Command exit code: ${output.code}`);
      console.log(`[${originalName}] stdout:`, output.stdout);
      console.log(`[${originalName}] stderr:`, output.stderr);

      if (output.code === 0) {
        setResults((prev) =>
          prev.map((r) =>
            r.original === originalName
              ? {
                  ...r,
                  output: outputPath,
                  status: "success",
                  message: "Converted successfully!",
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

      // Clean up temp file
      const { remove } = await import("@tauri-apps/plugin-fs");
      await remove(tempInputPath).catch(() => {});
    } catch (error) {
      console.error("Conversion error:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : typeof error === 'string'
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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsConverting(true);
      for (const file of acceptedFiles) {
        await convertToWebP(file);
      }
      setIsConverting(false);
    },
    [quality]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
      "image/tiff": [".tiff", ".tif"],
    },
    multiple: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
          Image to WebP Converter
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Convert your images to WebP on your computer, for free
        </p>

        {/* Quality Slider */}
        {/* <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality: {quality}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={isConverting}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Lower size</span>
            <span>Higher quality</span>
          </div>
        </div> */}

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-4 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
          } ${isConverting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            {isDragActive ? (
              <p className="text-lg text-blue-600 font-medium">
                Drop the images here...
              </p>
            ) : (
              <>
                <p className="text-lg text-gray-600 font-medium">
                  Drag & drop images here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PNG, JPEG, GIF, and TIFF formats
                </p>
              </>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Conversion Results
            </h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {result.original}
                    </p>
                    {result.output && (
                      <p className="text-sm text-gray-600">{result.output}</p>
                    )}
                    {result.message && (
                      <p
                        className={`text-sm ${
                          result.status === "error"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {result.message}
                      </p>
                    )}
                  </div>
                  <div>
                    {result.status === "converting" && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    )}
                    {result.status === "success" && (
                      <svg
                        className="h-6 w-6 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {result.status === "error" && (
                      <svg
                        className="h-6 w-6 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setResults([])}
              className="mt-4 w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Clear Results
            </button>
          </div>
        )}
      </div>

      {/* Footer with version */}
      <footer className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Version {version || "loading..."}
        </p>
      </footer>
    </div>
  );
}

export default App;
