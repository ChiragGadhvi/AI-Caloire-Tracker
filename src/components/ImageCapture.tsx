
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
  const [isCameraInitializing, setIsCameraInitializing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Clean up camera resources when component unmounts or camera closes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    // Reset states
    setCameraError(null);
    setIsCameraInitializing(true);

    try {
      // Stop any existing streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Request camera access with improved constraints
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      // Store stream reference for cleanup
      streamRef.current = newStream;
      
      // Wait a moment to ensure DOM is ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => {
                  setIsCameraOpen(true);
                  setIsCameraInitializing(false);
                })
                .catch(err => {
                  console.error('Error playing video:', err);
                  setCameraError('Error starting video stream');
                  setIsCameraInitializing(false);
                  stopCamera();
                });
            }
          };
        } else {
          throw new Error("Video element not available");
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(err.message || 'Could not access camera');
      toast.error('Could not access camera. Please check permissions.');
      setIsCameraInitializing(false);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && streamRef.current) {
      // Create a canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw the current video frame to canvas
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a file from blob
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
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Create preview URL
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
      <div className="relative aspect-video">
        {isCameraOpen ? (
          // Camera view
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover bg-black"
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

        {/* Camera active UI */}
        {isCameraOpen && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button
              onClick={captureImage}
              className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-black"
            >
              <div className="w-12 h-12 rounded-full border-4 border-[#9d4edd]"></div>
            </Button>
          </div>
        )}

        {/* Loading UI */}
        {isCameraInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Starting camera...</p>
            </div>
          </div>
        )}

        {/* Error UI */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-[#2A2F3C] p-4 rounded-md max-w-xs mx-auto text-center">
              <p className="text-red-400 mb-2">{cameraError}</p>
              <Button 
                onClick={() => setCameraError(null)}
                variant="outline"
                className="border-[#e0aaff] text-[#e0aaff] hover:bg-[#9d4edd]/10"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {!isCameraOpen && !isLoading && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={startCamera}
              className="bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90 text-white"
              disabled={isCameraInitializing}
            >
              {isCameraInitializing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-5 w-5" />
                  Take Photo
                </>
              )}
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

        {isCameraOpen && (
          <Button
            onClick={stopCamera}
            variant="outline" 
            className="w-full border-[#e0aaff] text-[#e0aaff] hover:bg-[#9d4edd]/10"
          >
            Cancel
          </Button>
        )}

        {preview && (
          <div className="space-y-4">
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
