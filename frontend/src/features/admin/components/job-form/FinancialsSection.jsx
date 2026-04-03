import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { STIPEND_FREQUENCY } from "@/features/admin/components/job-form/constants";
import ErrorText from "@/features/admin/components/job-form/ErrorText";

export default function FinancialsSection({ formData, formErrors, onInputChange }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Financials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>CTC (LPA) *</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={formData.packageLPA}
              onChange={(event) => onInputChange(null, "packageLPA", event.target.value)}
              className="mt-1"
            />
            <ErrorText error={formErrors.packageLPA} />
          </div>
          <div>
            <Label>Fixed (LPA)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={formData.salaryBreakup.fixed}
              onChange={(event) => onInputChange("salaryBreakup", "fixed", event.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Variable (LPA)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={formData.salaryBreakup.variable}
              onChange={(event) => onInputChange("salaryBreakup", "variable", event.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Stipend Amount</Label>
            <Input
              type="number"
              min="0"
              value={formData.stipend.amount}
              onChange={(event) => onInputChange("stipend", "amount", event.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Stipend Frequency</Label>
            <Select
              value={formData.stipend.frequency}
              onValueChange={(value) => onInputChange("stipend", "frequency", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {STIPEND_FREQUENCY.map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {frequency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Service Bond</p>
              <p className="text-xs text-muted-foreground">
                Enable only when bond policy applies.
              </p>
            </div>
            <Switch
              checked={formData.bond.hasBond}
              onCheckedChange={(checked) => onInputChange("bond", "hasBond", checked)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Bond Duration (Years)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={formData.bond.durationYears}
                onChange={(event) => onInputChange("bond", "durationYears", event.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Penalty Amount</Label>
              <Input
                type="number"
                min="0"
                value={formData.bond.penaltyAmount}
                onChange={(event) => onInputChange("bond", "penaltyAmount", event.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
