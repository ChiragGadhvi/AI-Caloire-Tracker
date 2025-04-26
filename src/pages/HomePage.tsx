
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3 text-[#9d4edd]">Welcome to Caloire Tracker</h1>
        <p className="text-muted-foreground max-w-md">
          Track your meals and nutrition with the power of AI. Simply take a photo 
          or upload an image of your food to get started.
        </p>
      </div>
      
      <div className="w-full max-w-md space-y-6">
        <div className="p-8 rounded-xl bg-gradient-to-br from-[#f8f7ff] to-[#f3eaff] border border-[#e0aaff]/30 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-center text-[#9d4edd]">Get Started</h2>
          
          <div className="space-y-4">
            <Button 
              className="w-full h-16 text-lg gap-3 bg-gradient-to-r from-[#9d4edd] to-[#c77dff] hover:opacity-90"
              onClick={() => navigate('/analyze')}
            >
              <Camera className="w-5 h-5" />
              Capture a Meal
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-16 text-lg gap-3 border-[#e0aaff] text-[#9d4edd] hover:bg-[#e0aaff]/10"
              onClick={() => navigate('/analyze')}
            >
              <Upload className="w-5 h-5" />
              Upload an Image
            </Button>
          </div>
        </div>
        
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#f3eaff] to-[#ffeaff] border border-[#e0aaff]/30 shadow-sm">
          <h3 className="font-medium mb-2 text-[#9d4edd]">How it works</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
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
