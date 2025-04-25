
import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImageCaptureProps {
  onImageCapture: (file: File) => void;
  isLoading: boolean;
}

const ImageCapture = ({ onImageCapture, isLoading }: ImageCaptureProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageCapture(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
          setPreview(URL.createObjectURL(blob));
          onImageCapture(file);
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCapturing(false);
  };

  return (
    <Card className="p-4 bg-card border-none shadow-lg">
      <div className="camera-frame bg-gradient-to-b from-muted/20 to-muted/10 rounded-2xl overflow-hidden aspect-video relative">
        {isCapturing ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-16 h-16 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={captureImage}
                disabled={isLoading}
              >
                <Camera className="w-8 h-8" />
              </Button>
            </div>
          </>
        ) : preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-muted-foreground">Ready to analyze your meal</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        {!isCapturing && (
          <>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <ImageIcon className="w-4 h-4" />
              Upload
            </Button>
            <Button className="gap-2" onClick={startCamera} disabled={isLoading}>
              <Camera className="w-4 h-4" />
              Camera
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default ImageCapture;
