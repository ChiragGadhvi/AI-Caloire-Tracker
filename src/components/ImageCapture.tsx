
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from '@/hooks/use-mobile';
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [aspectRatio, setAspectRatio] = useState('aspect-video');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraReady(false);
      
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadeddata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error("Error playing video:", err);
              setCameraError("Error starting camera feed");
            });
          }
        };
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            const videoAspect = videoRef.current.videoWidth / videoRef.current.videoHeight;
            setAspectRatio(videoAspect > 1 ? 'aspect-video' : 'aspect-[3/4]');
            setIsCameraReady(true);
          }
        };
        
        setStream(mediaStream);
      }

      setIsCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError("Could not access camera. Please check permissions.");
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraReady(false);
    setCameraError(null);
  };

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
      toast.error('Error processing the selected image.');
    }
  };

  const captureImage = () => {
    if (videoRef.current && isCameraReady) {
      setIsCapturing(true);
      
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
            
            // Also set the image data for analysis
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              setImageData(base64);
              
              // Only stop the camera after we've successfully processed the image
              stopCamera();
              setIsCapturing(false);
            };
            reader.readAsDataURL(file);
          } else {
            setIsCapturing(false);
            toast.error('Failed to capture image');
          }
        }, 'image/jpeg', 0.9);
      } else {
        setIsCapturing(false);
        toast.error('Your browser does not support canvas context');
      }
    }
  };

  const handleAnalyzeClick = async () => {
    if (imageData) {
      await onAnalyze(imageData);
    }
  };

  const resetCapture = () => {
    setPreview(null);
    setImageData(null);
    stopCamera();
  };

  // Clean up camera resources when component unmounts
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="relative">
        {/* Preview of captured or selected image */}
        {preview && !isCameraActive && (
          <div className="relative">
            <img 
              src={preview} 
              alt="Food preview" 
              className="w-full object-cover h-72 sm:h-96"
            />
            <div className="absolute top-2 right-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm text-black"
                onClick={resetCapture}
              >
                <X className="w-4 h-4 mr-1" />
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
                    Analyzing Meal...
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
        )}

        {/* Camera view */}
        {isCameraActive && (
          <div className="relative bg-black h-80 sm:h-[450px]">
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-red-500/10 rounded-full p-3 mb-2">
                  <Camera className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">{cameraError}</h3>
                <p className="text-white/70 text-sm mb-4">Please check your camera permissions in browser settings</p>
                <Button 
                  variant="outline"
                  onClick={stopCamera}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Go Back
                </Button>
              </div>
            )}
            
            {!isCameraReady && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2 text-white">Starting camera...</span>
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover",
                aspectRatio,
                (!isCameraReady || cameraError) && "invisible"
              )}
            />
            <div className="absolute top-2 left-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm text-black"
                onClick={stopCamera}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </div>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <Button 
                variant="default"
                size="lg"
                disabled={!isCameraReady || isCapturing || !!cameraError}
                className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-black disabled:bg-gray-300"
                onClick={captureImage}
              >
                {isCapturing ? (
                  <div className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full animate-pulse bg-gray-400"></div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full border-4 border-black"></div>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Upload/Camera options */}
        {!preview && !isCameraActive && (
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
