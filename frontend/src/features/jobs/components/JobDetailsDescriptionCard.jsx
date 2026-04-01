import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUpRight, Building2 } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";

const JobDetailsDescriptionCard = ({ job, activeTab, onTabChange }) => {
  return (
    <Card className="bg-card/50 border-border/50">
      <div className="flex border-b border-border px-6 pt-4 gap-6">
        <div
          onClick={() => onTabChange("job")}
          className={`pb-3 border-b-2 text-sm font-medium cursor-pointer transition-colors ${
            activeTab === "job"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Job description
        </div>
        <div
          onClick={() => onTabChange("company")}
          className={`pb-3 border-b-2 text-sm font-medium cursor-pointer transition-colors ${
            activeTab === "company"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          About company
        </div>
      </div>

      <CardContent className="p-6 md:p-8">
        {activeTab === "job" ? (
          <div className="prose prose-sm prose-stone dark:prose-invert max-w-none text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {job.description || "No description provided."}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-xl border border-border shrink-0">
                <Building2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{job.company?.name || "Company"}</h3>
                {job.company?.website && (
                  <a
                    href={job.company.website.startsWith("http") ? job.company.website : `https://${job.company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 mt-0.5 transition-colors w-fit"
                  >
                    {job.company.website}
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-border" />

            <div className="text-muted-foreground text-sm leading-relaxed">
              {job.company?.about ? (
                <p>{job.company.about}</p>
              ) : (
                <div className="space-y-4">
                  <p>
                    <strong className="text-foreground font-semibold">{job.company?.name || "This company"}</strong>{" "}
                    is currently actively hiring for the <strong className="text-foreground font-semibold">{job.title}</strong>{" "}
                    role based out of <strong className="text-foreground font-semibold">{job.location || "their main office"}</strong>.
                  </p>
                  <p>
                    A detailed company profile was not provided for this listing. Visit the official website above to learn more
                    about their products, services, and culture.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(JobDetailsDescriptionCard);
