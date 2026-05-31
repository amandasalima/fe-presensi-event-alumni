"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface SearchInputProps
  extends Omit<ComponentPropsWithoutRef<"input">, "onChange" | "value"> {
  value: string;
  onValueChange: (value: string) => void;
  leadingIcon?: ReactNode;
  wrapperClassName?: string;
}

export default function SearchInput({
  className,
  leadingIcon,
  onValueChange,
  type = "text",
  value,
  wrapperClassName,
  ...props
}: SearchInputProps) {
  const input = (
    <input
      {...props}
      type={type}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      className={className}
    />
  );

  if (wrapperClassName || leadingIcon) {
    return (
      <div className={wrapperClassName}>
        {leadingIcon}
        {input}
      </div>
    );
  }

  return input;
}
