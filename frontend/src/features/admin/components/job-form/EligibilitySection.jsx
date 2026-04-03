import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  DEPARTMENT_OPTIONS,
  GENDER_OPTIONS,
} from "@/features/admin/components/job-form/constants";
import ErrorText from "@/features/admin/components/job-form/ErrorText";

export default function EligibilitySection({ formData, formErrors, onInputChange }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Eligibility</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Min CGPA</Label>
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.eligibility.minCgpa}
              onChange={(event) => onInputChange("eligibility", "minCgpa", event.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Max Backlogs</Label>
            <Input
              type="number"
              min="0"
              value={formData.eligibility.maxBacklogs}
              onChange={(event) => onInputChange("eligibility", "maxBacklogs", event.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Profile Completeness (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.eligibility.minProfileCompleteness}
              onChange={(event) =>
                onInputChange("eligibility", "minProfileCompleteness", event.target.value)
              }
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Min 10th Marks (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.eligibility.minXthMarks}
              onChange={(event) => onInputChange("eligibility", "minXthMarks", event.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Min 12th Marks (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.eligibility.minXIIthMarks}
              onChange={(event) => onInputChange("eligibility", "minXIIthMarks", event.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Target Batch (comma separated years) *</Label>
          <Input
            value={formData.eligibility.targetBatch}
            onChange={(event) => onInputChange("eligibility", "targetBatch", event.target.value)}
            placeholder="e.g. 2026, 2027"
            className="mt-1"
          />
          <ErrorText error={formErrors["eligibility.targetBatch"]} />
        </div>

        <div>
          <Label>Allowed Departments (comma separated)</Label>
          <Input
            value={formData.eligibility.allowedDepartments}
            onChange={(event) =>
              onInputChange("eligibility", "allowedDepartments", event.target.value)
            }
            placeholder={DEPARTMENT_OPTIONS.join(", ")}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Allowed values: {DEPARTMENT_OPTIONS.join(", ")}.
          </p>
        </div>

        <div>
          <Label>Gender Allowed</Label>
          <Select
            value={formData.eligibility.genderAllowed}
            onValueChange={(value) => onInputChange("eligibility", "genderAllowed", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrorText error={formErrors["eligibility.genderAllowed"]} />
        </div>
      </CardContent>
    </Card>
  );
}
