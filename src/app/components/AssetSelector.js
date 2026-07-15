"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";

export default function AssetSelector({ onSelect, selectedBase64 }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/assets");
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error("Failed to fetch images", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        
        // 1. Instantly select for the form
        onSelect(base64Data);

        // 2. Upload to server
        const res = await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64Data,
            filename: file.name
          }),
        });
        
        const data = await res.json();
        if (data.success) {
          setImages(prev => [data.image, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectImage = async (url) => {
    try {
      // Need to convert url back to base64 for the generation API
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        onSelect(reader.result);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Failed to load image as base64", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div 
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors group
          ${uploading ? "border-gold/50 bg-gold/5" : "border-border hover:border-gold hover:bg-white/[0.02]"}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin mb-2" />
            <p className="text-sm text-off-white font-medium">Uploading & Saving...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-muted mb-2 group-hover:text-gold transition-colors" />
            <p className="text-sm font-medium text-off-white">Upload New Photo</p>
            <p className="text-[10px] text-muted mt-1 uppercase tracking-wider">Saved to your library automatically</p>
          </div>
        )}
      </div>

      {/* Library Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted uppercase tracking-widest font-semibold">Or select from your library</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img) => (
              <div 
                key={img.id} 
                className="aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:border-gold hover:opacity-80 transition-all relative group"
                onClick={() => handleSelectImage(img.url)}
              >
                <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <CheckCircle2 className="w-6 h-6 text-gold" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {loading && images.length === 0 && (
        <div className="flex justify-center p-4">
          <Loader2 className="w-5 h-5 text-muted animate-spin" />
        </div>
      )}
    </div>
  );
}
