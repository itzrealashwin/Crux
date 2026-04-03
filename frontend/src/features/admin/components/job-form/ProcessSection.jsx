import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

import DriveTimelineBuilder from "@/features/admin/components/job-form/DriveTimelineBuilder";
import { STAGE_COLORS } from "@/features/admin/components/job-form/constants";

export default function ProcessSection({ formData, onInputChange, onTimelineChange }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Process</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Required Skills (comma separated)</Label>
          <Input
            value={formData.skillsRequired}
            onChange={(event) => onInputChange(null, "skillsRequired", event.target.value)}
            placeholder="React, Node.js, SQL"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Selection Process (one step per line)</Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-1">
            A student-facing ordered list of rounds, keep it short and clear.
          </p>
          <Textarea
            value={formData.selectionProcess}
            onChange={(event) => onInputChange(null, "selectionProcess", event.target.value)}
            rows={5}
            placeholder={"Aptitude Test\nCoding Round\nTechnical Interview\nHR Interview"}
            className="mt-1"
          />
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Drive Timeline</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Schedule and track each stage of the drive. Visible to eligible students as a progress stepper.
              </p>
            </div>

            <div className="hidden sm:flex flex-wrap gap-x-3 gap-y-1 shrink-0">
              {Object.entries(STAGE_COLORS).map(([group, color]) => (
                <span key={group} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className={`inline-block h-2 w-2 rounded-full ${color.dot}`} />
                  {group}
                </span>
              ))}
            </div>
          </div>

          <DriveTimelineBuilder timeline={formData.driveTimeline} onChange={onTimelineChange} />
        </div>
      </CardContent>
    </Card>
  );
}
