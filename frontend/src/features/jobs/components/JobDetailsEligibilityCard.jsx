import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";

const JobDetailsEligibilityCard = ({ breakdown = [], skills }) => {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-sm">Profile vs job - eligibility check</h3>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> You have it
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" /> Missing
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {breakdown.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/50"
            >
              <div className="flex items-center gap-3">
                {item.isMet ? (
                  <div className="bg-white rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                ) : (
                  <div className="bg-white rounded-full">
                    <XCircle className="w-4 h-4 text-amber-500" />
                  </div>
                )}
                <span className="text-sm font-medium text-foreground/80">{item.name}</span>
              </div>
              <div className="text-xs font-medium font-mono">
                <span className={item.isMet ? "text-emerald-500" : "text-amber-500"}>{item.actual}</span>
                <span className="text-muted-foreground mx-1.5">{item.isMet ? ">=" : "<"}</span>
                <span className="text-muted-foreground/50">{item.required} required</span>
              </div>
            </div>
          ))}

          <div className="flex items-start justify-between p-3 rounded-lg border border-border/40 bg-background/50">
            <div className="flex items-start gap-3 pt-0.5">
              {skills?.matchCount === skills?.count ? (
                <div className="bg-white rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              ) : (
                <div className="bg-white rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                </div>
              )}
              <span className="text-sm font-medium text-foreground/80 mt-[-2px]">Required skills</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium font-mono text-emerald-500 mb-2 text-right">
                {skills?.matchCount || 0} of {skills?.count || 0} match
              </div>
              <div className="flex flex-wrap justify-end gap-1.5 w-full max-w-[250px]">
                {(skills?.required || []).map((skill) => {
                  const hasSkill = skills?.matched?.includes(skill);
                  return (
                    <Badge
                      key={skill}
                      variant="outline"
                      className={`font-normal text-[10px] rounded-full ${
                        hasSkill
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-transparent text-muted-foreground"
                      }`}
                    >
                      {skill}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(JobDetailsEligibilityCard);
