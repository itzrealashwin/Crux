import React from "react";
import { Card, CardContent } from "@/shared/ui/card";

const getTimelineItems = (job) => {
  // 1. Use the backend's driveTimeline exactly as defined by your schema
  if (Array.isArray(job.driveTimeline) && job.driveTimeline.length > 0) {
    return job.driveTimeline.map((stage) => ({
      key: stage.key,
      // Fallback to formatting the Enum key if the admin forgot to provide a label
      label: stage.label || stage.key.replace(/_/g, " ").toLowerCase(),
      date: stage.date,
      isDone: Boolean(stage.isDone),
      note: stage.note || null, // Capturing the note from your schema
    }));
  }

  // 2. Strict Fallback (using your Schema's exact enums) just in case the array is missing
  return [
    {
      key: "APPLICATION_OPEN",
      label: "Applications Open",
      date: job.createdAt,
      isDone: true,
    },
    {
      key: "APPLICATION_CLOSE",
      label: "Application Deadline",
      date: job.deadline,
      isDone: new Date(job.deadline) <= new Date(),
    },
    { key: "SHORTLIST_RELEASED", label: "Shortlist Released", date: null, isDone: false },
  ];
};

const formatTimelineDate = (dateValue) => {
  if (!dateValue) return "TBD";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const JobDetailsTimelineCard = ({ job }) => {
  const timelineItems = React.useMemo(() => getTimelineItems(job), [job]);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-6 md:p-8">
        <h3 className="font-semibold text-sm mb-6">Drive timeline</h3>

        <div className="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-border/50">
          {timelineItems.map((item) => (
            <div key={item.key} className={`relative flex items-start gap-3 ${item.isDone ? "" : "opacity-60"}`}>
              {/* Timeline Dot */}
              <div
                className={`absolute -left-6 mt-0.5 w-3 h-3 rounded-full ring-4 ring-background shrink-0 ${
                  item.isDone ? "bg-emerald-500" : "bg-muted border border-border"
                }`}
              />
              
              {/* Content */}
              <div className="flex-1">
                <p className={`text-sm font-medium leading-none mb-1 capitalize ${item.isDone ? "text-foreground" : "text-muted-foreground"}`}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{formatTimelineDate(item.date)}</p>
                
                {/* Displaying the 'note' field from your schema */}
                {item.note && (
                  <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md border border-border/50 inline-block">
                    {item.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(JobDetailsTimelineCard);