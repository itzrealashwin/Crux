import { CheckCircle2, Plus } from "lucide-react";

import TimelineStageCard from "@/features/admin/components/job-form/TimelineStageCard";
import {
  STAGE_COLORS,
  STAGE_DEFINITIONS,
  STAGE_GROUPS,
} from "@/features/admin/components/job-form/constants";

export default function DriveTimelineBuilder({ timeline, onChange }) {
  const selectedKeys = new Set(timeline.map((stage) => stage.key));

  const toggleStage = (stageDef) => {
    if (selectedKeys.has(stageDef.key)) {
      onChange(timeline.filter((stage) => stage.key !== stageDef.key));
      return;
    }

    onChange([
      ...timeline,
      {
        key: stageDef.key,
        label: stageDef.label,
        date: "",
        isDone: false,
        note: "",
      },
    ]);
  };

  const updateStage = (key, field, value) => {
    onChange(timeline.map((stage) => (stage.key === key ? { ...stage, [field]: value } : stage)));
  };

  const removeStage = (key) => {
    onChange(timeline.filter((stage) => stage.key !== key));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
        <div>
          <p className="text-sm font-medium">Stage Picker</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click to add or remove stages from the timeline. Order reflects insertion sequence.
          </p>
        </div>

        <div className="space-y-2.5">
          {STAGE_GROUPS.map((group) => {
            const groupStages = STAGE_DEFINITIONS.filter((stage) => stage.group === group);
            const colors = STAGE_COLORS[group];

            return (
              <div key={group} className="flex items-start gap-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-20 shrink-0 pt-1.5">
                  {group}
                </span>

                <div className="flex flex-wrap gap-1.5">
                  {groupStages.map((stageDef) => {
                    const isActive = selectedKeys.has(stageDef.key);
                    return (
                      <button
                        key={stageDef.key}
                        type="button"
                        onClick={() => toggleStage(stageDef)}
                        className={`
                          inline-flex items-center gap-1.5 rounded-full border px-3 py-1
                          text-xs font-medium transition-all duration-150
                          ${isActive ? colors.chipActive : colors.chip}
                        `}
                      >
                        {isActive ? (
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                        ) : (
                          <Plus className="h-3 w-3 shrink-0" />
                        )}
                        {stageDef.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {timeline.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Timeline
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {timeline.length} stage{timeline.length !== 1 ? "s" : ""}
                {timeline.filter((stage) => stage.isDone).length > 0 &&
                  ` · ${timeline.filter((stage) => stage.isDone).length} done`}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${(timeline.filter((stage) => stage.isDone).length / timeline.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {Math.round((timeline.filter((stage) => stage.isDone).length / timeline.length) * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {timeline.map((stage, index) => (
              <TimelineStageCard
                key={stage.key}
                stage={stage}
                index={index}
                total={timeline.length}
                onUpdate={(field, value) => updateStage(stage.key, field, value)}
                onRemove={() => removeStage(stage.key)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No stages added yet. Use the picker above to build your drive timeline.
          </p>
        </div>
      )}
    </div>
  );
}
