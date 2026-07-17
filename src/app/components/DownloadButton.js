"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";

export default function DownloadButton({ url, filename }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setDownloading(true);
      
      if (url.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || "asset.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename || "asset.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="p-1.5 rounded-full bg-gold/25 hover:bg-gold/40 border border-gold/30 text-gold hover:text-white transition-all flex items-center justify-center"
      title="Download Asset"
    >
      {downloading ? (
        <div className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
