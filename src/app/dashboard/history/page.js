"use client";

import React, { useState, useEffect } from "react";
import { Download, Image as ImageIcon, PlusCircle, Calendar } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        if (data.success) {
          setImages(data.images);
        } else {
          setError(data.error || "Failed to load history");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDownload = async (url, id) => {
    try {
      setDownloadingId(id);
      
      if (url.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = url;
        link.download = "kineticpro-thumbnail.png";
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
      link.download = "kineticpro-thumbnail.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(url, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="loader w-8 h-8 text-gold border-gold" />
        <p className="text-muted mt-4 text-xs uppercase tracking-widest">Loading Gallery...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-4 md:px-8 max-w-6xl mx-auto w-full animate-fadeIn">
      
      {/* Header */}
      <div className="w-full mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-widest brand-title uppercase mb-2">
            History <span className="text-gold font-light">& Gallery</span>
          </h1>
          <p className="text-xs text-muted uppercase tracking-[0.2em] font-light">
            {images.length} previously generated thumbnails
          </p>
        </div>
        <Link href="/dashboard" className="premium-btn py-2.5 px-6 flex items-center text-xs w-full md:w-auto justify-center">
          <PlusCircle className="w-4 h-4 mr-2" /> New Generation
        </Link>
      </div>

      {error && (
        <div className="w-full mb-6 bg-red-950/30 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-xs underline hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Grid */}
      {images.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh] text-center max-w-sm mx-auto">
          <div className="w-20 h-20 rounded-full bg-dark-gray border border-border flex items-center justify-center mb-6">
            <ImageIcon className="w-8 h-8 text-muted/50" />
          </div>
          <h3 className="text-xl text-off-white font-medium mb-2">No thumbnails yet</h3>
          <p className="text-sm text-muted font-light leading-relaxed mb-8">
            When you generate your first high-converting thumbnail, it will be securely saved here in your gallery.
          </p>
          <Link href="/dashboard" className="premium-btn w-full justify-center">
            Start Generating
          </Link>
        </div>
      ) : (
        <div className="w-full grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="premium-card p-4 flex flex-col gap-4 hover:border-gold/30 transition-all duration-300">
              <div className="relative group overflow-hidden rounded-lg border border-border/50 bg-charcoal shadow-inner aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.filename}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center text-muted/80 text-[10px] uppercase tracking-wider font-medium">
                  <Calendar className="w-3 h-3 mr-1.5" />
                  {new Date(img.createdAt).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                
                <button 
                  onClick={() => handleDownload(img.url, img.id)} 
                  disabled={downloadingId === img.id}
                  className="bg-dark-gray hover:bg-gold/10 text-off-white hover:text-gold border border-border hover:border-gold/30 rounded-md py-1.5 px-3 text-xs transition-colors flex items-center"
                >
                  {downloadingId === img.id ? (
                    <><div className="loader mr-1.5 w-3 h-3 border-gold" /> Downloading...</>
                  ) : (
                    <><Download className="w-3.5 h-3.5 mr-1.5" /> Download</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
