
import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Wheat, Droplet, Heart } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MealAnalysisProps {
  data: {
    name: string;
    calories: number;
    carbs: number;
    protein: number;
    fats: number;
    healthScore: number;
    description?: string;
  };
}

const MealAnalysis = ({ data }: MealAnalysisProps) => {
  return (
    <Card className="p-6 bg-card border-none shadow-lg">
      <h2 className="text-xl font-semibold mb-2">{data.name}</h2>
      {data.description && (
        <p className="text-sm text-muted-foreground mb-6">{data.description}</p>
      )}
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10">
            <Flame className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Calories</p>
            <p className="font-semibold">{data.calories}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Wheat className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Carbs</p>
            <p className="font-semibold">{data.carbs}g</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <div className="w-5 h-5 text-blue-500 font-semibold flex items-center justify-center">P</div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Protein</p>
            <p className="font-semibold">{data.protein}g</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Droplet className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fats</p>
            <p className="font-semibold">{data.fats}g</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-sm text-muted-foreground">Health score</span>
          </div>
          <span className="font-semibold">{data.healthScore}/10</span>
        </div>
        <Progress 
          value={data.healthScore * 10} 
          className={cn(
            "h-2",
            data.healthScore >= 7 ? "bg-emerald-950 [&>div]:bg-emerald-500" :
            data.healthScore >= 4 ? "bg-yellow-950 [&>div]:bg-yellow-500" :
            "bg-red-950 [&>div]:bg-red-500"
          )}
        />
      </div>
    </Card>
  );
};

export default MealAnalysis;
