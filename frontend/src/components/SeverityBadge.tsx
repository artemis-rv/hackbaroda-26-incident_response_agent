import { Badge } from "@/components/ui/badge";

interface SeverityBadgeProps {
  severity: string;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const normalized = severity?.toLowerCase() || "";

  let mappedSeverity = "P3 Medium";
  let classes = "bg-amber-500/15 text-amber-400 border-amber-500/20";

  if (normalized.includes("p1") || normalized === "critical") {
    mappedSeverity = "P1 Critical";
    classes = "bg-red-500/15 text-red-400 border-red-500/20";
  } else if (normalized.includes("p2") || normalized === "high") {
    mappedSeverity = "P2 High";
    classes = "bg-orange-500/15 text-orange-400 border-orange-500/20";
  } else if (normalized.includes("p3") || normalized === "medium") {
    mappedSeverity = "P3 Medium";
    classes = "bg-amber-500/15 text-amber-400 border-amber-500/20";
  } else if (normalized.includes("p4") || normalized === "low") {
    mappedSeverity = "P4 Low";
    classes = "bg-blue-500/15 text-blue-400 border-blue-500/20";
  }

  return (
    <Badge variant="outline" className={`font-semibold text-[10px] tracking-wider ${classes}`}>
      {mappedSeverity}
    </Badge>
  );
}
