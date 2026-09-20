import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "border-2 border-black px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all active:translate-x-0 active:translate-y-0";

  const variants = {
    primary:
      "bg-black text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[4px_4px_0_#000] active:shadow-[2px_2px_0_#000]",
    secondary:
      "bg-white text-black hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:shadow-[2px_2px_0_#000]",
  };

  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}