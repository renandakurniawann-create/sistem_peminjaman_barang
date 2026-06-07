import clsx from "clsx";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-workshop-500 text-white hover:bg-workshop-600 focus:ring-orange-200",
  secondary:
    "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 focus:ring-slate-200",
  navy: "bg-navy-900 text-white hover:bg-navy-800 focus:ring-navy-100",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-100",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-200",
};

const sizes = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  as: Component = "button",
  children,
  className,
  disabled,
  icon: Icon,
  loading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}) {
  const isNativeButton = Component === "button";

  return (
    <Component
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      {...(isNativeButton ? { disabled: disabled || loading, type } : {})}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="h-4 w-4" aria-hidden="true" />
      ) : null}
      {children ? <span>{children}</span> : null}
    </Component>
  );
}
