"use client";
type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "outline";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantToClasses: Record<BadgeVariant, string> = {
  default: "badge",
  success: "badge badge-success",
  warning: "badge badge-warning",
  destructive: "badge badge-destructive",
  outline: "badge badge-outline",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[variantToClasses[variant], className ?? ""].join(" ")}
      {...props}
    />
  );
}
