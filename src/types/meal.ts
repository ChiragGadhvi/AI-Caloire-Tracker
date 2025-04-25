
export interface MealAnalysisData {
  id?: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  healthScore: number;
  description?: string;
  image_url?: string;
  created_at?: string;
}
