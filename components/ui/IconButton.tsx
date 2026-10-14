import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export function IconButton({ className = "", children, ref, ...props }: IconButtonProps) {
  return (
    <button
      ref={ref}
      className={`flex h-[42px] w-[42px] items-center justify-center rounded-[4px] border-2 border-ink/16 transition-colors duration-150 hover:bg-ink/5 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
