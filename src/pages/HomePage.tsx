
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] py-8">
      <div className="text-center mb-12 animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="text-5xl">🥗</div>
        </div>
        <h1 className="text-4xl font-bold mb-3 text-[#9d4edd] dark:text-[#e0aaff]">Caloire Tracker</h1>
        <p className="text-muted-foreground dark:text-gray-300 max-w-md">
          Your AI-powered meal tracking assistant. Take a photo or upload an image of your food to analyze nutritional content instantly.
        </p>
      </div>
      
      <div className="w-full max-w-md space-y-6 animate-slide-up">
        <div className="p-8 rounded-xl bg-gradient-to-br from-[#f8f7ff] to-[#f3eaff] dark:from-gray-800 dark:to-gray-900 border border-[#e0aaff]/30 dark:border-[#9d4edd]/30 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-center text-[#9d4edd] dark:text-[#e0aaff]">Get Started</h2>
          
          <div className="space-y-4">
            <Button 
              className="w-full h-16 text-lg gap-3 bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90 text-white"
              onClick={() => navigate('/analyze')}
            >
              <Camera className="w-5 h-5" />
              Capture a Meal
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-16 text-lg gap-3 border-[#e0aaff] text-[#9d4edd] hover:bg-[#e0aaff]/10 dark:text-[#e0aaff] dark:border-[#9d4edd] dark:hover:bg-[#9d4edd]/10"
              onClick={() => navigate('/analyze')}
            >
              <Upload className="w-5 h-5" />
              Upload an Image
            </Button>
          </div>
        </div>
        
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#f3eaff] to-[#ffeaff] dark:from-gray-900 dark:to-gray-800 border border-[#e0aaff]/30 dark:border-[#9d4edd]/30 shadow-sm">
          <h3 className="font-medium mb-2 text-[#9d4edd] dark:text-[#e0aaff]">How it works</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>Take a photo of your meal or upload an image</li>
            <li>Our AI will analyze the nutritional content</li>
            <li>View detailed nutrition information</li>
            <li>Track your meals in the history section</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
