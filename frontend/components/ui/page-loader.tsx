import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  className?: string;
  fullScreen?: boolean;
}

export function PageLoader({ className, fullScreen = true }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex justify-center items-center",
        fullScreen ? "h-screen w-full" : "h-full w-full py-10",
        className
      )}
    >
      <Spinner className="size-20 text-primary" />
    </div>
  );
}
