import React from "react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const OnboardingStepAcademic = ({ formData, departments, onChange, onSelectChange }) => {
  return (
    <div className="grid gap-8">
      <div className="space-y-2">
        <Label className="text-base">Department <span className="text-destructive">*</span></Label>
        <Select value={formData.department} onValueChange={(value) => onSelectChange("department", value)}>
          <SelectTrigger className="bg-background h-11">
            <SelectValue placeholder="Select your current department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-base">Expected Graduation Year <span className="text-destructive">*</span></Label>
          <Input
            type="number"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={onChange}
            placeholder="e.g. 2025"
            className="bg-background h-11 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-base">10th Marks (%) <span className="text-destructive">*</span></Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            name="xthMarks"
            value={formData.xthMarks}
            onChange={onChange}
            onWheel={(e) => e.target.blur()}
            placeholder="e.g. 85.4"
            className="bg-background h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base">12th Marks (%) <span className="text-destructive">*</span></Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            name="xIIthMarks"
            value={formData.xIIthMarks}
            onChange={onChange}
            onWheel={(e) => e.target.blur()}
            placeholder="e.g. 82.1"
            className="bg-background h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base">Current CGPA</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="10"
            name="cgpa"
            value={formData.cgpa}
            onChange={onChange}
            onWheel={(e) => e.target.blur()}
            placeholder="e.g. 8.75"
            className="bg-background h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(OnboardingStepAcademic);
