import React, { useState } from "react";
import axios from "axios";
import {
  UploadCloud,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function UploadForm() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const handleUpload = async () => {
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/extract",
        // "https://ocr-python-p216.onrender.com/extract",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(response.data);
      toast.success("Extraction completed!");
      setOpenIndex(null);
    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-6">
        <UploadCloud className="w-7 h-7 text-blue-600" />
        OCR PDF Extractor
      </h1>

      <label className="block text-gray-700 text-sm font-semibold mb-1">
        Upload PDF File(s)
      </label>
      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={(e) => setFiles([...e.target.files])}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />

      {files.length > 0 && (
        <ul className="mb-4 text-sm text-gray-700 list-disc pl-5">
          {files.map((f, i) => (
            <li key={i}>{f.name}</li>
          ))}
        </ul>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !files.length}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" />
            Uploading...
          </>
        ) : (
          <>
            <UploadCloud className="w-4 h-4" />
            Upload & Extract
          </>
        )}
      </button>

      {result && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            📄 Extracted Results
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {result.length} document{result.length > 1 ? "s" : ""} processed.
          </p>

          <div className="space-y-4">
            {result.map((doc, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="bg-gray-100 rounded-xl border border-gray-300 shadow-sm transition"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex justify-between items-center px-4 py-3 text-left text-blue-700 font-medium hover:bg-blue-50 rounded-t-xl"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {doc.filename}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[500px]" : "max-h-0"
                    }`}
                  >
                    <div className="bg-white px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap max-h-[460px] overflow-auto border-t">
                      <div className="mb-2">
                        {Object.entries(doc.fields).length > 0 ? (
                          <ul className="list-disc pl-5">
                            {Object.entries(doc.fields).map(([key, value]) => (
                              <li key={key}>
                                <strong>{key}:</strong> {value}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">
                            No structured fields found.
                          </p>
                        )}
                      </div>

                      {Object.keys(doc.fields).length > 0 && (
                        <button
                          onClick={() =>
                            downloadJSON(
                              {
                                filename: doc.filename,
                                fields: doc.fields,
                                raw_text: doc.raw_text,
                              },
                              doc.filename.replace(".pdf", ".json")
                            )
                          }
                          className="text-blue-600 underline text-sm mt-2"
                        >
                          ⬇️ Download JSON (with Raw Text)
                        </button>
                      )}

                      <details className="mt-3">
                        <summary className="text-blue-600 cursor-pointer">
                          View Raw Text
                        </summary>
                        <pre className="bg-gray-100 p-3 mt-2 rounded-md text-gray-700 max-h-48 overflow-auto whitespace-pre-wrap">
                          {doc.raw_text}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadForm;
