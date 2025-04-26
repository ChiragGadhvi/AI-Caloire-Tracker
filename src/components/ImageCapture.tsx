
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
  const [attemptingCamera, setAttemptingCamera] = useState(false);
  const isMobile = useIsMobile();

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraReady(false);
      setAttemptingCamera(true);
      
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      console.log("Requesting camera access...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      console.log("Camera access granted");
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log("Set media stream to video element");
        
        // Make sure to set onloadeddata before playing to avoid race conditions
        videoRef.current.onloadeddata = () => {
          if (videoRef.current) {
            console.log("Video data loaded, playing...");
            videoRef.current.play().catch(err => {
              console.error("Error playing video:", err);
              setCameraError("Error starting camera feed");
              setAttemptingCamera(false);
            });
          }
        };
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            console.log("Video metadata loaded");
            const videoAspect = videoRef.current.videoWidth / videoRef.current.videoHeight;
            setAspectRatio(videoAspect > 1 ? 'aspect-video' : 'aspect-[3/4]');
            setTimeout(() => {
              setIsCameraReady(true);
              setAttemptingCamera(false);
            }, 500);
          }
        };

        videoRef.current.onerror = (e) => {
          console.error("Video element error:", e);
          setCameraError("Camera error occurred");
          setAttemptingCamera(false);
        };
        
        setStream(mediaStream);
      }

      setIsCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError("Could not access camera. Please check permissions.");
      toast.error('Could not access camera. Please check permissions.');
      setAttemptingCamera(false);
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
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
    setAttemptingCamera(false);
  };

  // Clean up camera resources when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        console.log("Component unmounted, stopping camera");
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
        
        // Add a slight delay before processing to give visual feedback
        setTimeout(() => {
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
              const imageUrl = URL.createObjectURL(blob);
              
              // Stop the camera first for better performance
              stopCamera();
              
              // Then set the preview
              setPreview(imageUrl);
              onImageCapture(file);
              
              // Also set the image data for analysis
              const reader = new FileReader();
              reader.onload = (e) => {
                const base64 = e.target?.result as string;
                setImageData(base64);
                setIsCapturing(false);
              };
              reader.readAsDataURL(file);
            } else {
              setIsCapturing(false);
              toast.error('Failed to capture image');
            }
          }, 'image/jpeg', 0.9);
        }, 150);
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

  return (
    <Card className="overflow-hidden shadow-lg dark:bg-gray-800 dark:border-gray-700">
      <div className="relative">
        {/* Preview of captured or selected image */}
        {preview && !isCameraActive && (
          <div className="relative">
            <img 
              src={preview} 
              alt="Food preview" 
              className="w-full object-cover h-96 sm:h-[500px]"
            />
            <div className="absolute top-2 right-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-black dark:text-white"
                onClick={resetCapture}
              >
                <X className="w-4 h-4 mr-1" />
                Retake
              </Button>
            </div>
            <div className="p-4">
              <Button
                className="w-full bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90 dark:text-white"
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
                  <Skeleton className="h-4 w-full dark:bg-gray-700" />
                  <Skeleton className="h-4 w-3/4 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-1/2 dark:bg-gray-700" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Camera view */}
        {isCameraActive && (
          <div className="relative bg-black h-96 sm:h-[500px]">
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black">
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
            
            {(attemptingCamera || !isCameraReady) && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-10 w-10 text-[#e0aaff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="mt-3 text-white font-medium">Starting camera...</span>
                </div>
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover",
                aspectRatio
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
                className={`rounded-full w-16 h-16 ${!isCameraReady ? 'bg-gray-300 cursor-not-allowed' : 'bg-white hover:bg-gray-100'} text-black disabled:bg-gray-300 transition-all duration-300`}
                onClick={captureImage}
              >
                {isCapturing ? (
                  <div className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full animate-pulse bg-[#9d4edd]"></div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full border-4 border-[#9d4edd]"></div>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Upload/Camera options */}
        {!preview && !isCameraActive && (
          <div className="flex flex-col items-center justify-center p-8 gap-8">
            <div className="text-center">
              <h3 className="font-semibold text-xl mb-2 text-[#9d4edd] dark:text-[#e0aaff]">Capture Your Meal</h3>
              <p className="text-muted-foreground dark:text-gray-300">
                Take a photo or upload an image to analyze
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
              <Button
                variant="outline"
                className="flex-1 h-16 text-lg gap-3 border-[#e0aaff] text-[#9d4edd] hover:bg-[#e0aaff]/10 dark:text-[#e0aaff] dark:border-[#9d4edd] dark:hover:bg-[#9d4edd]/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5" />
                Upload
              </Button>
              <Button 
                className="flex-1 h-16 text-lg gap-3 bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90 text-white"
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
