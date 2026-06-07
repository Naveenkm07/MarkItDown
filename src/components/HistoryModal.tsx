"use client";

import React, { useEffect, useState } from "react";
import localforage from "localforage";
import { History, X, Clock, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentInfo } from "./ResultWorkspace";

export interface HistoryItem {
  id: string;
  timestamp: number;
  markdown: string;
  docInfo: DocumentInfo;
}

interface HistoryModalProps {
  onSelectHistory: (markdown: string, docInfo: DocumentInfo) => void;
}

export function HistoryModal({ onSelectHistory }: HistoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const loadHistory = async () => {
    try {
      const items = await localforage.getItem<HistoryItem[]>("conversionHistory");
      if (items) {
        setHistoryItems(items.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const handleSelect = (item: HistoryItem) => {
    onSelectHistory(item.markdown, item.docInfo);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 dark:bg-[#111111] dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900 transition-colors"
      >
        <History className="w-4 h-4" />
        History
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#111111] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Recent Conversions
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {historyItems.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <History className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>No recent conversions found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-800 bg-gray-50/50 hover:bg-purple-50 dark:bg-black/20 dark:hover:bg-purple-900/10 transition-colors text-left group"
                      >
                        <div className="p-2 bg-white dark:bg-[#111111] rounded-md shadow-sm border border-gray-100 dark:border-gray-800 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {item.docInfo.name}
                          </p>
                          <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>{new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span>&bull;</span>
                            <span>{item.docInfo.pageCount} page(s)</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
