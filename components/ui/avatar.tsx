import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "h-6 w-6 text-xs", md: "h-8 w-8 text-sm", lg: "h-10 w-10 text-base" };

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary-light font-medium text-primary",
        sizes[size],
        className
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
