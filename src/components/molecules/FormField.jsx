import React from "react";
import { cn } from "@/utils/cn";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";

const FormField = React.forwardRef(({ 
  label, 
  error, 
  className,
  labelClassName,
  inputClassName,
  required,
  ...props 
}, ref) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          className={cn(
            required && "after:content-['*'] after:ml-0.5 after:text-red-500",
            labelClassName
          )}
        >
          {label}
        </Label>
      )}
      <Input
        ref={ref}
        className={cn(
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          inputClassName
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

FormField.displayName = "FormField";

export default FormField;