import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobById } from "@/features/jobs/hooks/useJobs.js";
import { useStudentProfile } from "@/features/student/hooks/useStudent.js";
import { useApplyForJob } from "@/features/applications/hooks/useApplicaitions.js";
import { Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/shared/ui/button";
import JobDetailsHeaderCard from "@/features/jobs/components/JobDetailsHeaderCard.jsx";
import JobDetailsDescriptionCard from "@/features/jobs/components/JobDetailsDescriptionCard.jsx";
import JobDetailsEligibilityCard from "@/features/jobs/components/JobDetailsEligibilityCard.jsx";
import JobDetailsSelectionProcessCard from "@/features/jobs/components/JobDetailsSelectionProcessCard.jsx";
import JobDetailsTimelineCard from "@/features/jobs/components/JobDetailsTimelineCard.jsx";
import JobDetailsSidebar from "@/features/jobs/components/JobDetailsSidebar.jsx";
import {
  evaluateJobEligibility,
  formatDeadlineInfo,
  formatSalaryText,
} from "@/features/jobs/components/jobDetails.utils.js";

export default function JobDetailsPage() {
  const { id: jobCode } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("job");

  const { mutate: apply, isPending: isApplying } = useApplyForJob();
  const { profile, isLoading: isLoadingProfile } = useStudentProfile();
  const studentProfile = profile?.data || profile;
  const { data: jobResponse, isLoading: isLoadingJob } = useJobById(jobCode);

  const job = jobResponse?.data || jobResponse || null;

  const { eligible, breakdown, skills } = useMemo(
    () => evaluateJobEligibility(job, studentProfile),
    [job, studentProfile],
  );

  const deadlineInfo = useMemo(() => formatDeadlineInfo(job?.deadline), [job?.deadline]);
  const salaryText = useMemo(() => formatSalaryText(job), [job]);
  const isClosed = job?.status === "CLOSED";
  const isLoading = isLoadingJob || isLoadingProfile;

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (!job)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
        Job not found
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      {/* Navbar */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 sm:px-6 max-w-[1400px] mx-auto w-full">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to jobs
        </Button>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <JobDetailsHeaderCard
              job={job}
              eligible={eligible}
              deadlineInfo={deadlineInfo}
              salaryText={salaryText}
            />

            <JobDetailsDescriptionCard
              job={job}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <JobDetailsEligibilityCard breakdown={breakdown} skills={skills} />

            <JobDetailsSelectionProcessCard selectionProcess={job.selectionProcess || []} />

            <JobDetailsTimelineCard job={job} />
          </div>

          <JobDetailsSidebar
            job={job}
            studentProfile={studentProfile}
            eligible={eligible}
            isApplying={isApplying}
            isClosed={isClosed}
            deadlineInfo={deadlineInfo}
            onApply={() => apply(job.jobCode || jobCode)}
          />
        </div>
      </main>
    </div>
  );
}
