"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageAsset } from "@/types";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: ImageAsset | ImageAsset[] | null;
  onChange: (value: ImageAsset | ImageAsset[] | null) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export function ImageUploader({
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const images: ImageAsset[] = Array.isArray(value)
    ? value
    : value
    ? [value]
    : [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();

      if (multiple) {
        for (let i = 0; i < Math.min(files.length, maxFiles - images.length); i++) {
          formData.append("images", files[i]);
        }
      } else {
        formData.append("image", files[0]);
      }

      const endpoint = multiple ? "/api/admin/upload-multiple" : "/api/admin/upload";
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploaded: ImageAsset | ImageAsset[] = res.data?.data;

      if (multiple) {
        const newImgs = Array.isArray(uploaded) ? uploaded : [uploaded];
        onChange([...images, ...newImgs]);
      } else {
        const singleImg = Array.isArray(uploaded) ? uploaded[0] : uploaded;
        onChange(singleImg);
      }

      toast.success("Image uploaded to Cloudinary successfully!");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to upload image"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    if (multiple) {
      const next = [...images];
      next.splice(index, 1);
      onChange(next);
    } else {
      onChange(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      {(!multiple && images.length === 0) || (multiple && images.length < maxFiles) ? (
        <label className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors text-center">
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span>Uploading to Cloudinary...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-primary">Click to upload</span> or drag & drop
                <span className="block text-muted-foreground mt-0.5">JPG, PNG, WEBP up to 5MB</span>
              </div>
            </>
          )}
        </label>
      ) : null}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-muted">
              <Image src={img.url} alt={`Uploaded ${idx + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
