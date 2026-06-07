"use client";

import React, { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { FileUp, File as FileIcon, X, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Tesseract from "tesseract.js";

interface UploadZoneProps {
  onConversionComplete: (markdown: string, fileInfo: { name: string; pageCount: number }) => void;
}

const LANGUAGES = [
  { code: "eng", name: "English" },
  { code: "hin", name: "Hindi" },
  { code: "tam", name: "Tamil" },
  { code: "spa", name: "Spanish" },
  { code: "fra", name: "French" },
  { code: "deu", name: "German" },
];

// A tiny valid PDF base64 string to act as the sample
const SAMPLE_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAzMDAgMTAwXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+ID4+ID4+ID4+CmVuZG9iago0IDAgb2JqCjw8IC9MZW5ndGggNTEgPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgoxMCA1MCBUZAooSGVsbG8gV29ybGQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTYgMDAwMDAgbiAKMDAwMDAwMDExMyAwMDAwMCBuIAowMDAwMDAwMjg0IDAwMDAwIG4gCnRyYWlsZXIKPDwgL1NpemUgNSAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKMzg2CiUlRU9GCg==";

function base64ToFile(base64: string, filename: string): File {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new window.File([bytes], filename, { type: "application/pdf" });
}

export function UploadZone({ onConversionComplete }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("eng");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError("");
      setProgress(0);
      setStatusMessage("");
    }
  }, []);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0];
    if (rejection.errors[0]?.code === "file-too-large") {
      toast.error("File is too large. Maximum size is 10MB.");
    } else if (rejection.errors[0]?.code === "file-invalid-type") {
      toast.error("Invalid file type. Please upload a PDF or Image.");
    } else {
      toast.error(rejection.errors[0]?.message || "File rejected");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading,
    noClick: file !== null,
  });

  const clearFile = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isUploading) return;
    setFile(null);
    setProgress(0);
    setStatusMessage("");
    setError("");
  };

  const executeUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setError("");
    setProgress(0);
    setStatusMessage("Initializing PDF parser...");

    try {
      let markdown = "";
      let numPages = 1;

      if (fileToUpload.type.startsWith("image/")) {
        setStatusMessage(`Running OCR on image (${language})...`);
        setProgress(10);
        
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileToUpload);
        });

        const result = await Tesseract.recognize(dataUrl, language, {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(10 + m.progress * 90));
            }
          }
        });

        markdown = result.data.text;
      } else {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const arrayBuffer = await fileToUpload.arrayBuffer();
        
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
          setStatusMessage(`Extracting page ${i} of ${numPages}...`);
          setProgress(Math.round(((i - 1) / numPages) * 100));

          const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        if (!context) throw new Error("Failed to get 2D context");
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // @ts-expect-error - pdfjs-dist types are problematic
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        
        setStatusMessage(`Running OCR on page ${i} of ${numPages} (${language})...`);
        
        const dataUrl = canvas.toDataURL("image/png");
        
        const result = await Tesseract.recognize(dataUrl, language, {
          logger: (m) => {
            if (m.status === "recognizing text") {
              const baseProgress = ((i - 1) / numPages) * 100;
              const pageProgress = m.progress * (100 / numPages);
              setProgress(Math.round(baseProgress + pageProgress));
            }
          }
        });
        
        markdown += `## Page ${i}\n\n${result.data.text}\n\n`;
      }
    }

      setProgress(100);
      setStatusMessage("Done!");
      
      onConversionComplete(markdown, {
        name: fileToUpload.name,
        pageCount: numPages
      });

    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred during conversion.");
      toast.error("Conversion failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!file || isUploading) return;
    executeUpload(file);
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!file || isUploading) return;
    executeUpload(file);
  };

  const handleSamplePdf = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sampleFile = base64ToFile(SAMPLE_PDF_BASE64, "hello_world_sample.pdf");
    setFile(sampleFile);
    executeUpload(sampleFile);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4 flex justify-end">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isUploading}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-[#111111] dark:text-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer disabled:opacity-50"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name} OCR
              </option>
            ))}
          </select>
        </div>

        <div
          {...getRootProps()}
          className={`relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-xl transition-all ${
            isUploading ? "cursor-default opacity-90" : "cursor-pointer"
          } ${
            isDragActive
              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10"
              : isDragReject || error
              ? "border-red-500 bg-red-50 dark:bg-red-900/10"
              : "border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div 
                key="file-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center space-y-4 w-full"
              >
                <div className={`p-4 rounded-full ${isUploading ? "bg-purple-100/50 dark:bg-purple-900/10" : error ? "bg-red-100 dark:bg-red-900/20" : "bg-purple-100 dark:bg-purple-900/20"}`}>
                  {isUploading ? (
                    <Loader2 className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-spin" />
                  ) : error ? (
                    <X className="w-10 h-10 text-red-600 dark:text-red-400" />
                  ) : (
                    <FileIcon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                
                <div className="w-full max-w-xs">
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate" title={file.name}>{file.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  
                  {isUploading && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="w-full space-y-2 mt-4"
                    >
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs font-medium text-purple-600 dark:text-purple-400">
                        <span>{statusMessage}</span>
                        <span>{progress}%</span>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-500 dark:text-red-400 mt-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                {!isUploading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 mt-4"
                  >
                    <button
                      onClick={clearFile}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                    {error ? (
                      <button
                        onClick={handleRetry}
                        className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors flex flex-row items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    ) : (
                      <button
                        onClick={handleUpload}
                        className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors flex flex-row items-center gap-2"
                      >
                        Upload & Convert
                      </button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="empty-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center space-y-4 pointer-events-none"
              >
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <FileUp className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {isDragActive ? "Drop the file here..." : "Drag & drop your PDF or Image here"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    or click to browse from your computer
                  </p>
                </div>
                <div className="flex gap-3 pointer-events-auto">
                  <button className="mt-4 px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors">
                    Select File
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {!file && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex justify-center"
        >
          <button
            onClick={handleSamplePdf}
            className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors underline underline-offset-4"
          >
            Don&apos;t have a PDF? Try a sample.
          </button>
        </motion.div>
      )}
    </div>
  );
}