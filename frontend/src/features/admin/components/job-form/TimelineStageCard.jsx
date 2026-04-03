import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  StickyNote,
  Trash2,
} from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  STAGE_COLORS,
  STAGE_DEFINITIONS,
} from "@/features/admin/components/job-form/constants";

export default function TimelineStageCard({ stage, index, total, onUpdate, onRemove }) {
  const [noteOpen, setNoteOpen] = useState(Boolean(stage.note));

  const stageDef = STAGE_DEFINITIONS.find((definition) => definition.key === stage.key);
  const colors = STAGE_COLORS[stageDef?.group ?? "Application"];

  return (
    <div
      className={`
        relative flex gap-0 rounded-lg border border-border overflow-hidden
        transition-shadow hover:shadow-sm
        ${stage.isDone ? "opacity-70" : ""}
      `}
    >
      <div className={`w-1 shrink-0 ${colors.dot}`} />

      <div className="flex-1 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground shrink-0">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span
              className={`
                inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold
                border ${colors.badge}
              `}
            >
              {stageDef?.group}
            </span>

            <span className="text-xs font-medium text-foreground truncate">
              {stage.key.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onUpdate("isDone", !stage.isDone)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title={stage.isDone ? "Mark as pending" : "Mark as done"}
            >
              {stage.isDone ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{stage.isDone ? "Done" : "Pending"}</span>
            </button>

            <button
              type="button"
              onClick={onRemove}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Remove stage"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Display Label</Label>
            <Input
              value={stage.label}
              onChange={(event) => onUpdate("label", event.target.value)}
              placeholder={stageDef?.label}
              className="h-8 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              Scheduled Date
            </Label>
            <Input
              type="date"
              value={stage.date}
              onChange={(event) => onUpdate("date", event.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setNoteOpen((value) => !value)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <StickyNote className="h-3 w-3" />
            {noteOpen ? "Hide note" : stage.note ? "Edit note" : "Add note"}
            {noteOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {noteOpen && (
            <Textarea
              value={stage.note}
              onChange={(event) => onUpdate("note", event.target.value)}
              placeholder='e.g. "Results published on the portal by 5 PM"'
              rows={2}
              className="mt-2 text-sm resize-none"
            />
          )}
        </div>
      </div>

      {index < total - 1 && (
        <div className={`absolute left-[1px] bottom-[-18px] w-0.5 h-4 ${colors.dot} opacity-30 z-10`} />
      )}
    </div>
  );
}
