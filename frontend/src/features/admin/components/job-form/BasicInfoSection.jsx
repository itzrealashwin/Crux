import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  JOB_TYPES,
  WORK_MODES,
} from "@/features/admin/components/job-form/constants";
import ErrorText from "@/features/admin/components/job-form/ErrorText";

export default function BasicInfoSection({ formData, formErrors, onInputChange }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Basic Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Job Title *</Label>
            <Input
              value={formData.title}
              onChange={(event) => onInputChange(null, "title", event.target.value)}
              placeholder="e.g. Software Engineer"
              className="mt-1"
            />
            <ErrorText error={formErrors.title} />
          </div>
          <div>
            <Label>Company Name *</Label>
            <Input
              value={formData.company.name}
              onChange={(event) => onInputChange("company", "name", event.target.value)}
              placeholder="e.g. Google"
              className="mt-1"
            />
            <ErrorText error={formErrors["company.name"]} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Website</Label>
            <Input
              value={formData.company.website}
              onChange={(event) => onInputChange("company", "website", event.target.value)}
              placeholder="https://company.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Logo URL</Label>
            <Input
              value={formData.company.logoUrl}
              onChange={(event) => onInputChange("company", "logoUrl", event.target.value)}
              placeholder="https://.../logo.png"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Company About</Label>
          <Textarea
            value={formData.company.about}
            onChange={(event) => onInputChange("company", "about", event.target.value)}
            rows={3}
            placeholder="One paragraph summary"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Job Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => onInputChange(null, "type", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorText error={formErrors.type} />
          </div>

          <div>
            <Label>Work Mode *</Label>
            <Select
              value={formData.workMode}
              onValueChange={(value) => onInputChange(null, "workMode", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {WORK_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorText error={formErrors.workMode} />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(event) => onInputChange(null, "location", event.target.value)}
              placeholder="e.g. Bangalore"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Vacancies *</Label>
            <Input
              type="number"
              min="1"
              value={formData.vacancies}
              onChange={(event) => onInputChange(null, "vacancies", event.target.value)}
              className="mt-1"
            />
            <ErrorText error={formErrors.vacancies} />
          </div>
          <div>
            <Label>Deadline *</Label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(event) => onInputChange(null, "deadline", event.target.value)}
              className="mt-1"
            />
            <ErrorText error={formErrors.deadline} />
          </div>
          <div>
            <Label>Attachment URL</Label>
            <Input
              value={formData.attachmentUrl}
              onChange={(event) => onInputChange(null, "attachmentUrl", event.target.value)}
              placeholder="https://..."
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Description *</Label>
          <Textarea
            value={formData.description}
            onChange={(event) => onInputChange(null, "description", event.target.value)}
            rows={8}
            placeholder="Role, responsibilities, qualification details"
            className="mt-1"
          />
          <ErrorText error={formErrors.description} />
        </div>
      </CardContent>
    </Card>
  );
}
