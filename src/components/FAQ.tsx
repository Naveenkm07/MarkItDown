"use client";

import React from "react";
import { motion } from "framer-motion";

export function FAQ() {
  const faqs = [
    {
      question: "What is OCR?",
      answer:
        "OCR stands for Optical Character Recognition. It's a technology that recognizes text within a digital image (like a scanned PDF or photo) and extracts it into machine-readable text data.",
    },
    {
      question: "How does this tool work?",
      answer:
        "When you upload a PDF, your browser securely processes each page and converts it into a high-resolution image. It then uses an advanced OCR engine (Tesseract) to extract the text from those images and formats it as clean Markdown.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes! 100% of the processing happens locally on your own device inside your web browser. Your files are never uploaded to any server, guaranteeing complete privacy and security.",
    },
    {
      question: "Does this work offline?",
      answer: "Yes! Because the entire conversion process runs directly in your browser, you can use this tool even without an active internet connection after the page has initially loaded.",
    },
    {
      question: "Why does the first conversion take longer?",
      answer: "The very first time you convert a document, your browser downloads a highly optimized language recognition model (about 20MB) to perform the OCR. All subsequent conversions will be much faster and won't require this download.",
    },
    {
      question: "Is there a file size limit?",
      answer: "We recommend keeping files under 10MB to ensure your browser doesn't run out of memory during the extraction process.",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="w-full max-w-3xl mx-auto mt-24 mb-12 text-left"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 px-4">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4 px-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-6 bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {faq.question}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}