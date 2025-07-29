import React from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({ 
  className, 
  type = "text", 
  ...props 
}, ref) => {
  const baseClasses = cn(
    "flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500",
    "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
    "transition-all duration-200",
    className
  );

  if (type === "textarea") {
    return (
      <textarea
        className={cn(baseClasses, "min-h-[80px] resize-none")}
        ref={ref}
        {...props}
      />
    );
  }

  return (
    <input
      type={type}
      className={cn(baseClasses, "h-10")}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;