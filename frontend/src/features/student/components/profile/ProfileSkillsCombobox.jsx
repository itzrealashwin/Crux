import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

function ProfileSkillsCombobox({ skillCatalog, selectedSkills, onAdd, isLoading }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const handler = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedKeySet = useMemo(() => {
    return new Set(
      selectedSkills
        .map((skill) => skill.skillCode || skill.name?.toLowerCase())
        .filter(Boolean),
    );
  }, [selectedSkills]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();

    if (!q) return [];

    return skillCatalog
      .filter((skill) => {
        const skillKey = skill.skillCode || skill.name?.toLowerCase();
        if (skillKey && selectedKeySet.has(skillKey)) return false;

        return [skill.name, skill.category, ...(skill.aliases || [])]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .slice(0, 10);
  }, [deferredQuery, selectedKeySet, skillCatalog]);

  const handleSelect = (skill) => {
    onAdd(skill);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if ((event.key === "Enter" || event.key === ",") && filtered.length > 0) {
      event.preventDefault();
      handleSelect(filtered[0]);
    }

    if (event.key === "ArrowDown" && query.trim().length > 0) {
      setOpen(true);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(event.target.value.trim().length > 0);
          }}
          onFocus={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search skills like React, PostgreSQL, Docker..."
          autoComplete="off"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={filtered.length === 0}
          onClick={() => filtered.length > 0 && handleSelect(filtered[0])}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading skills...
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((skill) => (
                <button
                  key={skill.skillCode || skill.name}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(skill);
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-medium text-foreground">{skill.name}</p>
                    {skill.aliases?.length > 0 && (
                      <p className="text-xs text-muted-foreground truncate">{skill.aliases.join(", ")}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
                    {skill.category}
                  </Badge>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-muted-foreground">No matching skills found.</div>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground mt-1.5">Press Enter or comma to add the top match.</p>
    </div>
  );
}

export default React.memo(ProfileSkillsCombobox);
