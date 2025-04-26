
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Loader2, RefreshCw } from 'lucide-react';
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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    return () => {
      // Clean up camera resources when component unmounts
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setIsInitializing(true);
    try {
      // Stop any existing camera stream
      stopCamera();
      
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      // Store stream reference
      streamRef.current = stream;
      
      console.log('Camera access granted, setting up video element');
      
      // Wait for DOM to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => {
                  console.log('Camera stream started successfully');
                  setIsCameraOpen(true);
                  setIsInitializing(false);
                })
                .catch(err => {
                  console.error('Failed to play video stream:', err);
                  toast.error('Failed to start video stream');
                  stopCamera();
                  setIsInitializing(false);
                });
            }
          };
        } else {
          console.error('Video element reference not available');
          toast.error('Camera initialization failed');
          stopCamera();
          setIsInitializing(false);
        }
      }, 300); // Give DOM time to render
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error('Could not access camera. Please check permissions.');
      stopCamera();
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && streamRef.current) {
      console.log('Capturing image...');
      
      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw video frame to canvas
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Image captured successfully');
            // Create file from blob
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);
            
            // Set preview and notify parent
            setPreview(imageUrl);
            onImageCapture(file);
            
            // Convert to base64 for analysis
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              setImageData(base64);
            };
            reader.readAsDataURL(file);
            
            // Stop camera after capture
            stopCamera();
          } else {
            console.error('Failed to create blob from canvas');
            toast.error('Failed to capture image');
          }
        }, 'image/jpeg', 0.9);
      }
    } else {
      console.error('Video element or stream not available for capture');
      toast.error('Cannot capture image - camera not ready');
    }
  };

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
      toast.error('Please capture or upload an image first');
    }
  };

  const resetCapture = () => {
    setPreview(null);
    setImageData(null);
  };

  return (
    <Card className="overflow-hidden bg-[#1A1F2C] border-gray-700">
      <div className="relative aspect-video bg-black">
        {isCameraOpen ? (
          // Camera view
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : preview ? (
          // Image preview
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          // Placeholder
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <Camera className="w-16 h-16 text-[#e0aaff] opacity-50" />
          </div>
        )}

        {/* Loading overlay */}
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-10 h-10 animate-spin text-white" />
              <p className="text-white">Starting camera...</p>
            </div>
          </div>
        )}

        {/* Capture button when camera is open */}
        {isCameraOpen && !isInitializing && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button
              onClick={captureImage}
              className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-black"
            >
              <div className="w-12 h-12 rounded-full border-4 border-[#9d4edd]"></div>
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {!isCameraOpen && !isInitializing && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={startCamera}
              className="bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90 text-white"
              disabled={isInitializing}
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

        {isCameraOpen && !isInitializing && (
          <Button
            onClick={stopCamera}
            variant="outline" 
            className="w-full border-[#e0aaff] text-[#e0aaff] hover:bg-[#9d4edd]/10"
          >
            Cancel
          </Button>
        )}

        {preview && !isLoading && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={resetCapture}
              variant="outline"
              className="border-[#e0aaff] text-[#e0aaff] hover:bg-[#9d4edd]/10"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Retake
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
