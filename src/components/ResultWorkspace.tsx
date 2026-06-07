"use client";

import React, { useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeMirror from "@uiw/react-codemirror";
import { markdown as markdownLang } from "@codemirror/lang-markdown";
import { Copy, Download, FileText, RefreshCw, File } from "lucide-react";
import { useTheme } from "next-themes";

export interface DocumentInfo {
  name: string;
  pageCount: number;
}

interface ResultWorkspaceProps {
  initialMarkdown: string;
  docInfo: DocumentInfo;
  onReset: () => void;
}

export function ResultWorkspace({ initialMarkdown, docInfo, onReset }: ResultWorkspaceProps) {
  const [markdown, setMarkdown] = React.useState(initialMarkdown);
  const { theme } = useTheme();

  // Calculate word count dynamically
  const wordCount = useMemo(() => {
    return markdown.trim().split(/\s+/).filter((w) => w.length > 0).length;
  }, [markdown]);

  // Dynamic Page Title and Favicon
  React.useEffect(() => {
    const originalTitle = document.title;
    
    // Create/update favicon
    let iconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!iconLink) {
      iconLink = document.createElement("link");
      iconLink.rel = "icon";
      document.head.appendChild(iconLink);
    }
    const originalIcon = iconLink.href;
    
    const activeFavicon = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📝</text></svg>";
    
    document.title = `Editing: ${docInfo.name} - MarkItDown`;
    iconLink.href = activeFavicon;

    return () => {
      document.title = originalTitle;
      iconLink.href = originalIcon;
    };
  }, [docInfo.name]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docInfo.name.replace(/\.[^/.]+$/, "")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([markdown], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docInfo.name.replace(/\.[^/.]+$/, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Toolbar & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-gray-800 gap-4 sm:gap-0">
        
        {/* Document Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100">
            <File className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="truncate max-w-[200px]" title={docInfo.name}>{docInfo.name}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-700" />
          <div className="flex items-center gap-3">
            <span><span className="font-semibold text-gray-900 dark:text-gray-200">{docInfo.pageCount}</span> Pages</span>
            <span><span className="font-semibold text-gray-900 dark:text-gray-200">{wordCount}</span> Words</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors whitespace-nowrap">
            <Copy className="w-4 h-4" />
            Copy Markdown
          </button>
          <button onClick={handleDownloadMd} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors whitespace-nowrap">
            <Download className="w-4 h-4" />
            Download .md
          </button>
          <button onClick={handleDownloadTxt} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors whitespace-nowrap">
            <FileText className="w-4 h-4" />
            Download .txt
          </button>
          <div className="w-px h-6 mx-1 bg-gray-200 dark:bg-gray-800" />
          <button onClick={onReset} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors whitespace-nowrap">
            <RefreshCw className="w-4 h-4" />
            New Conversion
          </button>
        </div>
      </div>

      {/* Dual Panes */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        
        {/* Left Pane: Code Editor */}
        <div className="flex flex-col border-r border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Raw Markdown
          </div>
          <div className="flex-1 overflow-auto bg-white dark:bg-[#0d0d0d]">
            <CodeMirror
              value={markdown}
              height="100%"
              extensions={[markdownLang()]}
              onChange={(value) => setMarkdown(value)}
              theme={theme === 'dark' ? 'dark' : 'light'}
              className="text-sm"
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                foldGutter: true,
              }}
            />
          </div>
        </div>

        {/* Right Pane: Live Preview */}
        <div className="flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Live Preview
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#111111]">
            <div className="prose prose-purple dark:prose-invert max-w-none">
              <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}