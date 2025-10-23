import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { FolderIcon } from "@heroicons/react/24/outline";
import type { ConversionResult } from "../types";

interface ConversionResultsProps {
  results: ConversionResult[];
  onClear: () => void;
}

export const ConversionResults = ({
  results,
  onClear,
}: ConversionResultsProps) => {
  const openFile = async (path: string) => {
    try {
      await revealItemInDir(path);
    } catch (error) {
      console.error("Failed to open file location:", error);
    }
  };

  if (results.length === 0) {
    return null;
  }

  return (
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
              <p className="font-medium text-gray-800">{result.original}</p>
              {result.output && (
                <button
                  onClick={() => openFile(result.output)}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer text-left"
                  title="Click to open file location"
                >
                  <FolderIcon className="h-4 w-4 flex-shrink-0" />
                  {result.output}
                </button>
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
        onClick={onClear}
        className="mt-4 w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
      >
        Clear Results
      </button>
    </div>
  );
};
