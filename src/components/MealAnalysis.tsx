
import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Wheat, Droplet, Heart } from 'lucide-react';

interface MealAnalysisProps {
  data: {
    name: string;
    calories: number;
    carbs: number;
    protein: number;
    fats: number;
    healthScore: number;
  };
}

const MealAnalysis = ({ data }: MealAnalysisProps) => {
  return (
    <Card className="p-6 bg-secondary">
      <h2 className="text-xl font-semibold mb-4">{data.name}</h2>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex items-center gap-2">
          <Flame className="text-red-500" />
          <div>
            <p className="text-sm text-muted-foreground">Calories</p>
            <p className="font-semibold">{data.calories}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Wheat className="text-yellow-500" />
          <div>
            <p className="text-sm text-muted-foreground">Carbs</p>
            <p className="font-semibold">{data.carbs}g</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-blue-500">P</div>
          <div>
            <p className="text-sm text-muted-foreground">Protein</p>
            <p className="font-semibold">{data.protein}g</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Droplet className="text-purple-500" />
          <div>
            <p className="text-sm text-muted-foreground">Fats</p>
            <p className="font-semibold">{data.fats}g</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="text-red-500" />
            <span className="text-sm text-muted-foreground">Health score</span>
          </div>
          <span className="font-semibold">{data.healthScore}/10</span>
        </div>
        <Progress value={data.healthScore * 10} className="h-2" />
      </div>
    </Card>
  );
};

export default MealAnalysis;
