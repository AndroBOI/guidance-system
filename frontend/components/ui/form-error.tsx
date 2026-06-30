import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex justify-center items-center gap-x-3 text-red-600 px-4 py-3 rounded bg-red-50 border border-red-200",
        className
      )}
    >
      <Info className="text-red-600 shrink-0" size={20} />
      <span className="text-sm">{message}</span>
    </div>
  );
}
