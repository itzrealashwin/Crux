import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

const JobDetailsHeaderCard = ({ job, eligible, deadlineInfo, salaryText }) => {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-6 md:p-8">
        <div className="flex gap-5">
          <Avatar className="h-14 w-14 rounded-lg border border-border bg-muted/50 hidden sm:block">
            <AvatarImage src={job.company?.logoUrl} />
            <AvatarFallback className="rounded-lg font-bold text-muted-foreground">
              {job.company?.name?.substring(0, 3).toUpperCase() || "CMP"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{job.title}</h1>
            <p className="text-muted-foreground font-medium flex items-center gap-1.5">
              {job.company?.name || "Company"} · {job.location || "Remote"}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className={eligible ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 font-normal rounded-full" : "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 font-normal rounded-full"}>
                {eligible ? "Fully eligible" : "Not eligible"}
              </Badge>

              <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-400/5 font-normal rounded-full">
                {job.type || "Full time"}
              </Badge>

              <Badge variant="outline" className="text-muted-foreground font-normal rounded-full">
                {job.workMode || "On-site"}
              </Badge>

              {job.eligibility?.targetBatch?.length > 0 && (
                <Badge variant="outline" className="text-muted-foreground font-normal rounded-full">
                  Batch {job.eligibility.targetBatch.join(", ")}
                </Badge>
              )}

              <Badge variant="outline" className="text-muted-foreground font-normal rounded-full">
                {job.vacancies || 0} vacancies
              </Badge>

              <Badge variant="outline" className="text-amber-500/80 border-amber-500/30 bg-amber-500/5 font-normal rounded-full">
                {deadlineInfo.text.split("-")[0].trim()}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total CTC</p>
            <p className="font-semibold text-lg leading-tight">{salaryText}</p>
            {job.salaryBreakup?.fixed > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Fixed {job.salaryBreakup.fixed} + Variable {job.salaryBreakup.variable}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Bond</p>
            <p className="font-semibold text-lg leading-tight">
              {job.bond?.hasBond ? `${job.bond?.durationYears} Years` : "None"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {job.bond?.hasBond ? `Penalty: INR ${job.bond?.penaltyAmount}` : "No service agreement"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Joining</p>
            <p className="font-semibold text-lg leading-tight">Jul 2026</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{job.location || "Office"} office</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(JobDetailsHeaderCard);
