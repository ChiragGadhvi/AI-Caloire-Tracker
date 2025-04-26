
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ImageCapture from '../components/ImageCapture';
import MealAnalysis from '../components/MealAnalysis';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { MealAnalysisData } from '@/types/meal';

const AnalyzePage = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<MealAnalysisData | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    const filename = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('meal-images')
      .upload(filename, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('meal-images')
      .getPublicUrl(filename);

    return publicUrl;
  };

  const handleImageCapture = (file: File) => {
    setSelectedImage(file);
    setAnalysisData(null);
  };

  const handleAnalyze = async (imageData: string) => {
    if (!imageData || !selectedImage) {
      toast.error('No image selected');
      return;
    }

    setAnalyzing(true);
    try {
      const imageUrl = await uploadImage(selectedImage);
      
      const loadingToast = toast.loading('Analyzing your meal...');
      
      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: { image: imageData }
      });

      toast.dismiss(loadingToast);

      if (error) throw error;
      if (!data) throw new Error("No analysis data returned");

      const { data: savedAnalysis, error: dbError } = await supabase
        .from('meal_analyses')
        .insert([{
          name: data.name,
          calories: data.calories,
          carbs: data.carbs,
          protein: data.protein,
          fats: data.fats,
          health_score: data.healthScore,
          description: data.description,
          image_url: imageUrl
        }])
        .select()
        .single();

      if (dbError) throw dbError;
      
      const transformedAnalysis: MealAnalysisData = {
        id: savedAnalysis.id,
        name: savedAnalysis.name,
        calories: savedAnalysis.calories,
        carbs: savedAnalysis.carbs,
        protein: savedAnalysis.protein,
        fats: savedAnalysis.fats,
        healthScore: savedAnalysis.health_score,
        description: savedAnalysis.description || '',
        image_url: savedAnalysis.image_url,
        created_at: savedAnalysis.created_at
      };

      setAnalysisData(transformedAnalysis);
      toast.success('Meal analyzed successfully!');
      
      setTimeout(() => {
        const resultsElement = document.getElementById('analysis-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (error) {
      console.error('Error analyzing meal:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMealUpdate = (updatedMeal: MealAnalysisData) => {
    setAnalysisData(updatedMeal);
  };

  return (
    <div className="space-y-8 py-4">
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Analyze Your Meal</h2>
        <p className="text-muted-foreground">Take a photo or upload an image to get nutritional information</p>
      </div>
      
      <ImageCapture 
        onImageCapture={handleImageCapture} 
        onAnalyze={handleAnalyze}
        isLoading={analyzing} 
      />
      
      {analysisData && !analyzing && (
        <div id="analysis-results" className="pt-4 animate-fade-in">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Analysis Results</h3>
          <MealAnalysis 
            data={analysisData} 
            onUpdate={handleMealUpdate}
          />
        </div>
      )}

      {analyzing && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-muted-foreground mt-4">Analyzing your meal with AI...</p>
          <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
        </div>
      )}
    </div>
  );
};

export default AnalyzePage;
