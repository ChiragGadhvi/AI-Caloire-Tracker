
import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';

interface ImageCaptureProps {
  onImageCapture: (file: File) => void;
  onAnalyze: (image: string) => Promise<void>;
  isLoading: boolean;
}

const ImageCapture = ({ onImageCapture, onAnalyze, isLoading }: ImageCaptureProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      console.log('File selected:', file.name);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageCapture(file);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImageData(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (imageData) {
      await onAnalyze(imageData);
    } else {
      toast.error('Please upload an image first');
    }
  };

  const resetCapture = () => {
    setPreview(null);
    setImageData(null);
  };

  return (
    <Card className="overflow-hidden bg-[#1A1F2C] border-gray-700">
      <div className="relative aspect-video bg-black">
        {preview ? (
          // Image preview
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          // Upload placeholder
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <Upload className="w-16 h-16 text-[#e0aaff] opacity-50" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {!preview && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90 text-white"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Image
          </Button>
        )}

        {preview && !isLoading && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={resetCapture}
              variant="outline"
              className="border-[#e0aaff] text-[#e0aaff] hover:bg-[#9d4edd]/10"
            >
              Upload New Image
            </Button>
            
            <Button
              onClick={handleAnalyze}
              className="bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Meal'
              )}
            </Button>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
    </Card>
  );
};

export default ImageCapture;
