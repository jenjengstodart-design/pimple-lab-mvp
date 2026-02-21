import { useState, useRef } from "react";
import { Upload, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageSelected: (base64: string) => void;
  label?: string;
  className?: string;
}

export function ImageUpload({ onImageSelected, label = "Upload Photo", className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onImageSelected(base64String);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative group border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-out cursor-pointer overflow-hidden",
          isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-secondary/50",
          preview ? "border-solid p-0 h-64 md:h-80 bg-black/5" : "bg-white/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !preview && inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Upload preview" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all transform hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">{label}</p>
              <p className="text-sm text-muted-foreground mt-1">Drag & drop or click to upload</p>
            </div>
            <div className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Supports JPG, PNG
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
