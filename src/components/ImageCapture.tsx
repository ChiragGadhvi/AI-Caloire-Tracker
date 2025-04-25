
import React, { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CameraModal from './CameraModal';

interface ImageCaptureProps {
  onImageCapture: (file: File) => void;
  onAnalyze: (image: string) => Promise<void>;
  isLoading: boolean;
}

const ImageCapture = ({ onImageCapture, onAnalyze, isLoading }: ImageCaptureProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    try {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageCapture(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImageData(base64);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  const handleCameraCapture = (file: File) => {
    processSelectedFile(file);
    setIsCameraOpen(false);
  };

  const handleAnalyzeClick = async () => {
    if (imageData) {
      await onAnalyze(imageData);
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="relative">
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full object-cover aspect-video"
            />
            <div className="absolute top-2 right-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm text-black"
                onClick={() => {
                  setPreview(null);
                  setImageData(null);
                }}
              >
                Retake
              </Button>
            </div>
            <div className="p-4">
              <Button
                className="w-full"
                size="lg"
                onClick={handleAnalyzeClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : 'Analyze Meal'}
              </Button>

              {isLoading && (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 gap-8">
            <div className="text-center">
              <h3 className="font-semibold text-xl mb-2">Capture Your Meal</h3>
              <p className="text-muted-foreground">
                Take a photo or upload an image to analyze
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
              <Button
                variant="outline"
                className="flex-1 h-16 text-lg gap-3"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5" />
                Upload
              </Button>
              <Button 
                className="flex-1 h-16 text-lg gap-3"
                onClick={() => setIsCameraOpen(true)}
              >
                <Camera className="w-5 h-5" />
                Camera
              </Button>
            </div>
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

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </Card>
  );
};

export default ImageCapture;
