import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Github,
  Linkedin,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

const ProfileLeftColumn = ({
  student,
  user,
  initials,
  completeness,
  onOpenBasicEdit,
  onOpenContactEdit,
}) => {
  return (
    <div className="lg:col-span-4 space-y-6">
        <Card className="bg-card border-border/50 shadow-none rounded-xl overflow-hidden text-center">
          <CardContent className="p-6 md:p-8 flex flex-col items-center">
            <Avatar className="h-24 w-24 rounded-full border border-border bg-muted mb-4">
              <AvatarImage src={student.photo?.url} />
              <AvatarFallback className="text-2xl font-bold text-primary bg-primary/10">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground mb-1">{student.firstName} {student.lastName}</h2>
            <p className="text-xs text-muted-foreground font-medium mb-4">
              {student.department || "B.Tech CS"} · Batch {student.graduationYear || "2026"}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {student.bio || "Update your bio to tell recruiters about your passions and goals."}
            </p>
            <Button variant="outline" size="sm" className="w-full mb-4 text-xs" onClick={onOpenBasicEdit}>
              Edit Basic Info
            </Button>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1" asChild>
                <a
                  href={student.links?.github || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={!student.links?.github ? "opacity-50 pointer-events-none" : ""}
                >
                  <Github className="w-4 h-4 mr-2" /> GitHub
                </a>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a
                  href={student.links?.linkedin || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={!student.links?.linkedin ? "opacity-50 pointer-events-none" : ""}
                >
                  <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-none rounded-xl">
          <CardContent className="p-6 space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Profile completeness</span>
                <span className="text-sm font-bold text-amber-500">{completeness}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                { label: "Photo uploaded", done: !!student.photo?.url },
                { label: "Bio added", done: !!student.bio },
                { label: "CGPA entered", done: !!student.cgpa },
                { label: "Resume uploaded", done: !!student.resume?.url },
                { label: `Skills added (${student.skills?.length || 0})`, done: (student.skills?.length || 0) >= 5 },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5 text-foreground">
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  {label}
                </div>
              ))}
              {(!student.projects || student.projects.length === 0) && (
                <div className="flex items-center gap-2.5 text-amber-500 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> Add at least 1 project
                </div>
              )}
              {(!student.xthMarks || !student.xIIthMarks) && (
                <div className="flex items-center gap-2.5 text-amber-500 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> Add 10th & 12th marks
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-none rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Contact & links</CardTitle>
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={onOpenContactEdit}>Edit</Button>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Phone</span>
                <span className="text-foreground font-medium">{student.phone || "Not added"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground font-medium">{user?.email || "student@college.edu"}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">GitHub</span>
                {student.links?.github ? (
                  <a href={student.links.github} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate max-w-[150px]">
                    {student.links.github.replace("https://github.com/", "")}
                  </a>
                ) : (
                  <span className="text-muted-foreground/50 italic">Not added</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">LinkedIn</span>
                {student.links?.linkedin ? (
                  <a href={student.links.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline">View Profile</a>
                ) : (
                  <span className="text-muted-foreground/50 italic">Not added</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Portfolio</span>
                {student.links?.portfolio ? (
                  <a href={student.links.portfolio} target="_blank" rel="noreferrer" className="text-primary hover:underline">View Website</a>
                ) : (
                  <span className="text-muted-foreground/50 italic">Not added</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default React.memo(ProfileLeftColumn);
