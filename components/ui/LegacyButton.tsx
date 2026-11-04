import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "lg";
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:brightness-95 active:brightness-90",
  secondary: "bg-primary/16 text-primary hover:bg-primary/24",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-[42px] px-[16px] py-[8px] text-p3 font-bold",
  lg: "px-[72px] py-[16px] text-p2 font-bold",
};

export function LegacyButton({
  variant = "primary",
  size = "sm",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[4px] font-display transition-[filter,background-color] duration-150 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
