import React from "react";
import { CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/shared/ui/button";

const OnboardingStepReview = ({ formData, resumeFile, onEditStep }) => {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground mb-6 text-sm">
        Take a moment to verify your information. You can always edit these details later from your dashboard settings,
        but it is best to start strong.
      </p>

      <div className="bg-muted/30 border border-border rounded-xl divide-y divide-border overflow-hidden">
        <div className="p-5 flex justify-between items-center hover:bg-muted/50 transition-colors">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
            <p className="text-lg font-semibold">{formData.firstName} {formData.lastName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(0)} className="text-muted-foreground hover:text-foreground">Edit</Button>
        </div>

        <div className="p-5 flex justify-between items-center hover:bg-muted/50 transition-colors">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Academic Details</p>
            <p className="text-lg font-semibold">{formData.department} - Class of {formData.graduationYear}</p>
            {formData.cgpa && <p className="text-sm text-muted-foreground mt-1">CGPA: {formData.cgpa}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(1)} className="text-muted-foreground hover:text-foreground">Edit</Button>
        </div>

        <div className="p-5 flex justify-between items-center hover:bg-muted/50 transition-colors">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Attached Resume</p>
            <div className={`text-base font-semibold flex items-center gap-2 ${resumeFile ? "text-primary" : "text-muted-foreground"}`}>
              {resumeFile ? (
                <>
                  <FileText className="h-5 w-5" />
                  {resumeFile.name}
                </>
              ) : (
                "No resume uploaded"
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(2)} className="text-muted-foreground hover:text-foreground">Edit</Button>
        </div>
      </div>

      <div className="flex gap-3 p-4 bg-primary/10 text-primary rounded-xl text-sm border border-primary/20">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          By clicking finish, you agree to make this profile visible to verified recruiting companies interacting with
          the placement cell.
        </p>
      </div>
    </div>
  );
};

export default React.memo(OnboardingStepReview);
