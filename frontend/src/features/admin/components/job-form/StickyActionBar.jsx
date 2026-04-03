import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

export default function StickyActionBar({
  isDirty,
  isSubmitting,
  onCancel,
  onSaveDraft,
  onPublish,
}) {
  return (
    // 1. Changed 'sticky' to 'fixed'
    // 2. Added 'left-0 right-0' to span the screen
    // 3. z-50 keeps it on top of everything
    <div className=" fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]">
      
      {/* We add a container inside to keep the buttons aligned with your main page content */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        
        <p className="text-xs font-medium text-muted-foreground">
          {isDirty ? "You have unsaved changes" : "Ready to submit"}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="bg-transparent"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            className="bg-transparent"
            onClick={onSaveDraft}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save as Draft
          </Button>

          <Button type="button" onClick={onPublish} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}