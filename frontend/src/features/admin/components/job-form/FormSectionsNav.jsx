import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export default function FormSectionsNav({ sections, activeSection, onSectionClick }) {
  return (
    <div className="fixed top-16 left-1/2 z-40 w-[calc(100vw-1.5rem)] max-w-4xl -translate-x-1/2 px-1 sm:top-20">
      <div className="rounded-2xl border border-border bg-background/90 p-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Tabs value={activeSection} onValueChange={onSectionClick}>
          <div className="overflow-x-auto">
            <TabsList className="h-10 w-max min-w-full justify-start gap-1 bg-muted/70 p-1">
              {sections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="h-8 px-4 text-xs sm:text-sm"
                >
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
