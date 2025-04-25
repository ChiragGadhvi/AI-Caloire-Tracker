
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ImageCapture from '../components/ImageCapture';
import MealAnalysis from '../components/MealAnalysis';
import { toast } from 'sonner';

// Define the MealAnalysisData type locally to avoid dependency on types.ts
interface MealAnalysisData {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  healthScore: number;
  description?: string;
  image_url?: string;
}

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<MealAnalysisData | null>(null);

  const handleImageCapture = async (file: File) => {
    setAnalyzing(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        // Call the analyze-meal function
        const { data, error } = await supabase.functions.invoke('analyze-meal', {
          body: { image: base64Image }
        });

        if (error) throw error;

        // Store analysis in database using generic typing to bypass type checking
        const { error: dbError } = await supabase
          .from('meal_analyses' as any)
          .insert([{
            ...data,
            image_url: base64Image
          }] as any);

        if (dbError) throw dbError;

        setAnalysisData(data);
      };
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center">Meal Snap AI</h1>
      
      <ImageCapture onImageCapture={handleImageCapture} isLoading={analyzing} />
      
      {analyzing && (
        <div className="text-center py-4">
          <p className="text-muted-foreground animate-pulse">
            Analyzing your meal...
          </p>
        </div>
      )}
      
      {analysisData && !analyzing && (
        <MealAnalysis data={analysisData} />
      )}
    </div>
  );
};

export default Index;
