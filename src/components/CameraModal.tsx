
import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraModal = ({ isOpen, onClose, onCapture }: CameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [aspectRatio, setAspectRatio] = useState('aspect-video');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);

        videoRef.current.onloadedmetadata = () => {
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

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCapturedImage(null);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
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
            canvas.toDataURL('image/jpeg', 0.8);
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage(imageUrl);
            onCapture(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>Take Photo</DrawerTitle>
        </DrawerHeader>
        
        <div className="relative flex-1 bg-black">
          {!capturedImage && (
            <div className="relative h-full">
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
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                <Button 
                  variant="default"
                  size="lg"
                  className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-black"
                  onClick={captureImage}
                >
                  <div className="w-12 h-12 rounded-full border-4 border-black"></div>
                </Button>
              </div>
            </div>
          )}
          
          {capturedImage && (
            <div className="relative h-full">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CameraModal;
