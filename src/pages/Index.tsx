
import { useState } from 'react';
import ImageCapture from '../components/ImageCapture';
import MealAnalysis from '../components/MealAnalysis';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleImageCapture = async (file: File) => {
    setAnalyzing(true);
    try {
      // Here we'll simulate the API call for now
      // In reality, you would send the image to OpenAI's API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated response
      setAnalysisData({
        name: "Pancakes with blueberries",
        calories: 615,
        carbs: 93,
        protein: 11,
        fats: 21,
        healthScore: 7
      });
    } catch (error) {
      toast.error("Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Meal Snap AI</h1>
      
      <ImageCapture onImageCapture={handleImageCapture} />
      
      {analyzing && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Analyzing your meal...</p>
        </div>
      )}
      
      {analysisData && !analyzing && (
        <div className="space-y-4">
          <MealAnalysis data={analysisData} />
          <div className="flex justify-end">
            <Button variant="outline">Fix Results</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
