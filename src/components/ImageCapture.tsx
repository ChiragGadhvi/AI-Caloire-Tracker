
import React, { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && stream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);
            setPreview(imageUrl);
            onImageCapture(file);

            // Convert to base64 for analysis
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageCapture(file);

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
      toast.error('Please capture or upload an image first');
    }
  };

  return (
    <Card className="overflow-hidden bg-[#1A1F2C] border-gray-700">
      <div className="relative aspect-video">
        {isCameraOpen ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button
                onClick={captureImage}
                className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-black"
              >
                <div className="w-12 h-12 rounded-full border-4 border-[#9d4edd]"></div>
              </Button>
            </div>
          </>
        ) : preview ? (
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <Camera className="w-16 h-16 text-[#e0aaff] opacity-50" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {!isCameraOpen && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={startCamera}
              className="bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90 text-white"
            >
              <Camera className="mr-2 h-5 w-5" />
              Take Photo
            </Button>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-[#e0aaff] text-[#e0aaff] hover:bg-[#9d4edd]/10"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload
            </Button>
          </div>
        )}

        {preview && (
          <Button
            className="w-full bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90 text-white"
            onClick={handleAnalyze}
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Meal'}
          </Button>
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
