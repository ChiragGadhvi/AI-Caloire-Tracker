
import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImageCaptureProps {
  onImageCapture: (file: File) => void;
}

const ImageCapture = ({ onImageCapture }: ImageCaptureProps) => {
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
    <Card className="p-4 bg-secondary">
      <div className="camera-frame">
        {isCapturing ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="scan-area" />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
              <Button
                className="rounded-full w-16 h-16 bg-white hover:bg-white/90"
                onClick={captureImage}
              />
            </div>
          </>
        ) : preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <p className="text-muted-foreground">No image selected</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center gap-4">
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
            >
              <ImageIcon className="w-4 h-4" />
              Upload
            </Button>
            <Button className="gap-2" onClick={startCamera}>
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
