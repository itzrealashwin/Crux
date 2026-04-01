import React from "react";
import { ArrowUpRight, Download, Flag, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

const JobDetailsSidebar = ({
  job,
  studentProfile,
  eligible,
  isApplying,
  onApply,
  deadlineInfo,
  isClosed,
}) => {
  return (
    <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-red-400 mb-4 pb-4 border-b border-border/40">
            <Flag className="w-3.5 h-3.5" />
            {deadlineInfo.text}
          </div>

          <div className="space-y-3 mb-5">
            <Button
              className="w-full"
              disabled={!eligible || isClosed || isApplying || job.status !== "OPEN"}
              onClick={onApply}
            >
              {isApplying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Apply now <ArrowUpRight className="w-4 h-4 ml-1.5 opacity-70" />
            </Button>
            <Button variant="outline" className="w-full bg-transparent border-border/50">
              Save for later
            </Button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Status</span>
              <span className={eligible ? "text-emerald-500 font-medium" : "text-amber-500 font-medium"}>
                {eligible ? "Eligible" : "Not eligible"}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Vacancies</span>
              <span className="text-foreground font-medium">{job.vacancies || "Open"}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Applicants so far</span>
              <span className="text-foreground font-medium">{job.stats?.totalApplications || 0}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Your profile</span>
              <span className="text-foreground font-medium">{studentProfile?.profileCompleteness || 68}%</span>
            </div>
          </div>

          {studentProfile?.profileCompleteness < 80 && (
            <p className="text-[10px] text-amber-500/80 mt-3 pt-3 border-t border-border/40 leading-relaxed">
              Profile {studentProfile?.profileCompleteness || 68}% - complete it to strengthen your application.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-5">
          <h3 className="text-xs font-semibold text-foreground mb-4">Eligibility criteria</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Min CGPA</span>
              <span className="text-foreground">{job.eligibility?.minCgpa?.toFixed(1) || "Any"}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Max backlogs</span>
              <span className="text-foreground">{job.eligibility?.maxBacklogs ?? 0}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Branches</span>
              <span className="text-foreground text-right max-w-[120px] truncate">
                {job.eligibility?.allowedDepartments?.join(", ") || "All"}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Batch</span>
              <span className="text-foreground">{job.eligibility?.targetBatch?.join(", ") || "All"}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>10th marks</span>
              <span className="text-foreground">
                {job.eligibility?.minXthMarks ? `${job.eligibility.minXthMarks}%+` : "Any"}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Gender</span>
              <span className="text-foreground">{job.eligibility?.genderAllowed || "Any"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {job.attachmentUrl && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold text-foreground mb-3">Attachments</h3>
            <Button variant="outline" className="w-full justify-start text-muted-foreground font-normal bg-transparent border-border/50" asChild>
              <a href={job.attachmentUrl} target="_blank" rel="noreferrer">
                <Download className="w-4 h-4 mr-2" /> Download full JD (PDF)
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default React.memo(JobDetailsSidebar);
