
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface ImageCaptureProps {
  onImageCapture: (file: File) => void;
  onAnalyze: (image: string) => Promise<void>;
  isLoading: boolean;
}

const ImageCapture = ({ onImageCapture, onAnalyze, isLoading }: ImageCaptureProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraOpen(true);
      }
    } catch (err) {
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {isCameraOpen ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button
              onClick={captureImage}
              className="w-16 h-16 rounded-full border-4 border-white bg-transparent"
            />
          </div>
        </>
      ) : preview ? (
        <div className="relative h-full">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
            <Button
              onClick={() => {
                setPreview(null);
                setImageData(null);
                startCamera();
              }}
              variant="outline"
              className="w-32"
            >
              Retake
            </Button>
            <Button
              onClick={handleAnalyze}
              className="w-32 bg-[#9d4edd]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                'Analyze'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Button
            onClick={startCamera}
            className="w-48 bg-[#9d4edd]"
          >
            <Camera className="mr-2 h-5 w-5" />
            Take Photo
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-48"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Image
          </Button>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default ImageCapture;
