
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ImageCaptureProps {
  onImageCapture: (file: File) => void;
  onAnalyze: (image: string) => Promise<void>;
  isLoading: boolean;
}

const ImageCapture = ({ onImageCapture, onAnalyze, isLoading }: ImageCaptureProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureReady, setCaptureReady] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('aspect-video');
  const isMobile = useIsMobile();

  const uploadToStorage = async (file: File): Promise<string> => {
    const filename = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('meal-images')
      .upload(filename, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('meal-images')
      .getPublicUrl(filename);

    return publicUrl;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);

        videoRef.current.onloadedmetadata = () => {
          setCaptureReady(true);
          if (videoRef.current) {
            const videoAspect = videoRef.current.videoWidth / videoRef.current.videoHeight;
            setAspectRatio(videoAspect > 1 ? 'aspect-video' : 'aspect-[3/4]');
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const captureImage = () => {
    if (videoRef.current && captureReady) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
            onImageCapture(file);

            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              setImageData(base64);
            };
            reader.readAsDataURL(file);

            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setCaptureReady(false);
  };

  const resetCapture = () => {
    setPreview(null);
    setImageData(null);
    stopCamera();
  };

  const handleAnalyzeClick = async () => {
    if (imageData) {
      await onAnalyze(imageData);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      stopCamera();
    };
  }, [preview]);

  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="relative">
        {isCapturing ? (
          <div className="relative bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn("w-full h-full object-cover", aspectRatio)}
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
              <Button
                variant="default"
                size="lg"
                className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-black shadow-lg"
                onClick={captureImage}
                disabled={!captureReady}
              >
                <div className="w-12 h-12 rounded-full border-4 border-black"></div>
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                onClick={stopCamera}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>
        ) : preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full object-cover aspect-video"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm text-black"
                onClick={resetCapture}
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
                onClick={startCamera}
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
    </Card>
  );
};

export default ImageCapture;
