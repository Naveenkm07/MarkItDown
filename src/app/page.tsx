"use client";

import { useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { ResultWorkspace, DocumentInfo } from "@/components/ResultWorkspace";
import { FAQ } from "@/components/FAQ";
import { motion, AnimatePresence } from "framer-motion";
import localforage from "localforage";
import { HistoryModal, HistoryItem } from "@/components/HistoryModal";

export default function Home() {
  const [markdown, setMarkdown] = useState<string>("");
  const [docInfo, setDocInfo] = useState<DocumentInfo | null>(null);

  const handleConversionComplete = async (content: string, info: { name: string; pageCount: number }) => {
    setMarkdown(content);
    setDocInfo(info);

    try {
      const history = (await localforage.getItem<HistoryItem[]>("conversionHistory")) || [];
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        markdown: content,
        docInfo: info,
      };
      
      const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50 items
      await localforage.setItem("conversionHistory", newHistory);
    } catch (err) {
      console.error("Failed to save to history", err);
    }
  };

  const handleReset = () => {
    setMarkdown("");
    setDocInfo(null);
  };

  return (
    <AnimatePresence mode="wait">
      {markdown && docInfo ? (
        <motion.main 
          key="workspace"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col flex-1 w-full"
        >
          <ResultWorkspace 
            initialMarkdown={markdown} 
            docInfo={docInfo} 
            onReset={handleReset} 
          />
        </motion.main>
      ) : (
        <motion.main 
          key="upload"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="flex flex-1 flex-col items-center pt-24 pb-12 w-full overflow-y-auto"
        >
          <div className="max-w-3xl w-full text-center space-y-8 px-4 md:px-0">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
                MarkIt<span className="text-purple-600 dark:text-purple-500">Down</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Convert PDF to Markdown instantly using OCR.
              </p>
              <div className="flex justify-center pt-2">
                <HistoryModal onSelectHistory={handleConversionComplete} />
              </div>
            </motion.div>
            
            <UploadZone onConversionComplete={handleConversionComplete} />
          </div>

          <FAQ />
        </motion.main>
      )}
    </AnimatePresence>
  );
}