import React from "react";
import { Card, CardContent } from "@/shared/ui/card";

const JobDetailsSelectionProcessCard = ({ selectionProcess = [] }) => {
  if (!selectionProcess.length) return null;

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-6 md:p-8">
        <h3 className="font-semibold text-sm mb-6">Selection process</h3>
        <div className="space-y-4">
          {selectionProcess.map((round, index) => (
            <div key={`${round.name}-${index}`} className="flex items-start gap-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted border border-border/50 text-xs font-medium text-muted-foreground shrink-0 mt-0.5">
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/90">{round.name}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(JobDetailsSelectionProcessCard);
