import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";

const OnboardingSidebar = ({ steps, currentStep, onNavigateHome }) => {
  return (
    <div className="bg-muted/30 lg:w-[400px] xl:w-[450px] p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border lg:h-full lg:overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 text-primary">
          <div onClick={onNavigateHome} className="flex items-center cursor-pointer">
            <div className="relative flex items-center justify-center text-2xl text-primary rounded-md shadow-sm">
              <span className="font-['Outfit'] font-bold text-2xl">C</span>
            </div>
            <div className="flex items-baseline font-['Outfit'] font-bold text-2xl tracking-tight text-foreground">
              rux
              <span className="w-1.5 h-1.5 rounded-full bg-primary ml-1 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="mt-10 mb-12">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Build Your Profile</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your profile is your digital resume on campus. A complete and accurate representation of your academic and
            professional journey significantly increases your chances of matching with top recruiting companies.
          </p>
        </div>

        <nav className="space-y-8">
          {steps.map((step, index) => {
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;

            return (
              <div key={step.id} className="flex items-start gap-4 relative">
                {index !== steps.length - 1 && (
                  <div className={`absolute left-3.5 top-10 w-0.5 h-10 ${isCompleted ? "bg-primary" : "bg-border"}`} />
                )}

                <div
                  className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/10"
                      : isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border-2 border-border text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                </div>

                <div className={`transition-opacity duration-300 pt-0.5 ${isActive ? "opacity-100" : "opacity-60"}`}>
                  <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>{step.label}</p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-muted-foreground mt-1"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="hidden lg:block mt-12 space-y-6">
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
            <Info className="w-4 h-4" />
            Pro Tip
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Students who upload their resume and provide links to active GitHub repositories or live portfolios are 3x
            more likely to be shortlisted for technical interviews.
          </p>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Facing issues? <a href="#" className="text-primary hover:underline font-medium">Contact Placement Cell</a>
        </p>
      </div>
    </div>
  );
};

export default React.memo(OnboardingSidebar);
