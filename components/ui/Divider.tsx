interface DividerProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Divider({ orientation = "horizontal", className = "" }: DividerProps) {
  if (orientation === "vertical") {
    return <div className={`w-px self-stretch ${className}`} />;
  }
  return <div className={`h-px w-full ${className}`} />;
}
