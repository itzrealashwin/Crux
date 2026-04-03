import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import BasicInfoSection from "@/features/admin/components/job-form/BasicInfoSection";
import FinancialsSection from "@/features/admin/components/job-form/FinancialsSection";
import EligibilitySection from "@/features/admin/components/job-form/EligibilitySection";
import ProcessSection from "@/features/admin/components/job-form/ProcessSection";
import StickyActionBar from "@/features/admin/components/job-form/StickyActionBar";
import { Separator } from "@/shared/ui/separator";

import {
  GENDER_OPTIONS,
  INITIAL_FORM_STATE,
  JOB_TYPES,
  WORK_MODES,
} from "@/features/admin/components/job-form/constants";

import {
  buildPayload,
  mapJobToForm,
  parseNumberList,
} from "@/features/admin/components/job-form/utils";

import { useJobById, useJobMutations } from "@/features/jobs/hooks/useJobs.js";

export default function JobFormPage() {
  const navigate = useNavigate();
  const { jobCode } = useParams();
  const isEditMode = Boolean(jobCode);

  const { data: job, isLoading: isJobLoading } = useJobById(jobCode);
  const { createJob, updateJob, isCreating, isUpdating } = useJobMutations();

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const isSubmitting = isCreating || isUpdating;

  // ------------------ LOAD DATA ------------------
  useEffect(() => {
    if (isEditMode && job) {
      setFormData(mapJobToForm(job));
      setFormErrors({});
      setIsDirty(false);
    }
  }, [isEditMode, job]);

  // ------------------ HELPERS ------------------
  const pageTitle = useMemo(
    () => (isEditMode ? "Edit Job Drive" : "Post New Job Drive"),
    [isEditMode]
  );

  const handleInputChange = (section, field, value) => {
    setIsDirty(true);

    setFormErrors((prev) => ({
      ...prev,
      [`${section ? `${section}.` : ""}${field}`]: "",
    }));

    setFormData((prev) => {
      if (!section) return { ...prev, [field]: value };

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  };

  const handleTimelineChange = (timeline) => {
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, driveTimeline: timeline }));
  };

  const validate = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = "Job title required";
    if (!formData.company.name.trim())
      errors["company.name"] = "Company name required";
    if (!formData.description.trim())
      errors.description = "Description required";
    if (!formData.deadline) errors.deadline = "Deadline required";

    if (Number(formData.packageLPA) < 0)
      errors.packageLPA = "Invalid CTC";

    if (Number(formData.vacancies) < 1)
      errors.vacancies = "Min 1 vacancy";

    if (!parseNumberList(formData.eligibility.targetBatch).length)
      errors["eligibility.targetBatch"] = "Batch required";

    if (!JOB_TYPES.includes(formData.type))
      errors.type = "Invalid type";

    if (!WORK_MODES.includes(formData.workMode))
      errors.workMode = "Invalid work mode";

    if (!GENDER_OPTIONS.includes(formData.eligibility.genderAllowed))
      errors["eligibility.genderAllowed"] = "Invalid gender";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (status) => {
    if (!validate()) {
      toast.error("Fix errors first");
      return;
    }

    const payload = buildPayload(formData, status);

    try {
      if (isEditMode) {
        await updateJob({ id: jobCode, data: payload });
      } else {
        await createJob(payload);
      }
      navigate("/admin/jobs");
    } catch {}
  };

  // ------------------ LOADING ------------------
  if (isEditMode && isJobLoading) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ------------------ UI ------------------
  return (
    <div className="pb-24">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <p className="text-sm text-muted-foreground">
          Structured workflow for job drives
        </p>
      </div>

      {/* MAIN CONTENT */}
      <main className="space-y-8">
          <section>
            <BasicInfoSection
              formData={formData}
              formErrors={formErrors}
              onInputChange={handleInputChange}
            />
          </section>

          <Separator />

          <section>
            <FinancialsSection
              formData={formData}
              formErrors={formErrors}
              onInputChange={handleInputChange}
            />
          </section>

          <Separator />

          <section>
            <EligibilitySection
              formData={formData}
              formErrors={formErrors}
              onInputChange={handleInputChange}
            />
          </section>

          <Separator />

          <section>
            <ProcessSection
              formData={formData}
              onInputChange={handleInputChange}
              onTimelineChange={handleTimelineChange}
            />
          </section>
      </main>

      {/* ACTION BAR */}
      <StickyActionBar
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/admin/jobs")}
        onSaveDraft={() => onSubmit("DRAFT")}
        onPublish={() => onSubmit("OPEN")}
      />
    </div>
  );
}