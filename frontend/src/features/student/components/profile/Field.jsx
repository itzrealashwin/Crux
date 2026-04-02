import React from "react";
import { Label } from "@/shared/ui/label";

const Field = ({ label, children }) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
};

export default React.memo(Field);
