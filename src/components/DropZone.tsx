import { useDropzone } from "react-dropzone";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface DropZoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isConverting: boolean;
}

export const DropZone = ({ onDrop, isConverting }: DropZoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
      "image/tiff": [".tiff", ".tif"],
    },
    multiple: true,
    noClick: false,
    noKeyboard: false,
    noDrag: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-4 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
        isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
      } ${isConverting ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="space-y-3">
        <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400" />
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
  );
};
