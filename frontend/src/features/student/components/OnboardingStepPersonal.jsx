import React from "react";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

const OnboardingStepPersonal = ({ formData, onChange }) => {
  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-base">First Name <span className="text-destructive">*</span></Label>
          <Input name="firstName" value={formData.firstName} onChange={onChange} placeholder="e.g. Jane" className="bg-background h-11" />
        </div>
        <div className="space-y-2">
          <Label className="text-base">Last Name <span className="text-destructive">*</span></Label>
          <Input name="lastName" value={formData.lastName} onChange={onChange} placeholder="e.g. Doe" className="bg-background h-11" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-base">Short Bio</Label>
          <Badge variant="secondary" className="font-normal">Boosts Score</Badge>
        </div>
        <Textarea
          name="bio"
          value={formData.bio}
          onChange={onChange}
          placeholder="A brief summary about your academic interests and career goals (max 500 chars)"
          maxLength={500}
          className="bg-background resize-none min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-base">Phone Number</Label>
          <Badge variant="secondary" className="font-normal">Optional</Badge>
        </div>
        <Input
          name="phone"
          value={formData.phone}
          onChange={onChange}
          placeholder="+91 99999 99999"
          className="bg-background h-11"
        />
        <p className="text-sm text-muted-foreground mt-1">
          We'll only use this for urgent placement updates or interview scheduling.
        </p>
      </div>
    </div>
  );
};

export default React.memo(OnboardingStepPersonal);
