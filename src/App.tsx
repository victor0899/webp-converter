import { useConversion } from "./hooks/useConversion";
import { useDragDrop } from "./hooks/useDragDrop";
import { DropZone } from "./components/DropZone";
import { ConversionResults } from "./components/ConversionResults";
import { Footer } from "./components/Footer";
import "./App.css";

function App() {
  const {
    results,
    isConverting,
    setIsConverting,
    convertFiles,
    clearResults,
  } = useConversion();

  useDragDrop(convertFiles, setIsConverting);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-grow p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
            Image to WebP Converter
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Convert your images to WebP on your computer, for free
          </p>

          <DropZone onDrop={convertFiles} isConverting={isConverting} />

          <ConversionResults results={results} onClear={clearResults} />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;
