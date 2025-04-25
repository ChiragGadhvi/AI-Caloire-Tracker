
import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Wheat, Droplet, Heart } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MealAnalysisData } from '@/types/meal';

interface MealAnalysisProps {
  data: MealAnalysisData;
}

const MealAnalysis = ({ data }: MealAnalysisProps) => {
  return (
    <Card className="p-4 bg-card border-none shadow-lg">
      <h3 className="text-lg font-semibold mb-2">{data.name}</h3>
      {data.description && (
        <p className="text-sm text-muted-foreground mb-4">{data.description}</p>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/10">
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Calories</p>
            <p className="font-medium text-sm">{data.calories}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-500/10">
            <Wheat className="w-4 h-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Carbs</p>
            <p className="font-medium text-sm">{data.carbs}g</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <div className="w-4 h-4 text-blue-500 font-medium flex items-center justify-center text-sm">P</div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Protein</p>
            <p className="font-medium text-sm">{data.protein}g</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10">
            <Droplet className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fats</p>
            <p className="font-medium text-sm">{data.fats}g</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10">
              <Heart className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-xs text-muted-foreground">Health score</span>
          </div>
          <span className="font-medium text-sm">{data.healthScore}/10</span>
        </div>
        <Progress 
          value={data.healthScore * 10} 
          className={cn(
            "h-1.5",
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
