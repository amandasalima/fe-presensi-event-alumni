"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

const inputTextColors = [
  "text-gray-400",
  "text-gray-500",
  "text-gray-600",
  "text-gray-700",
  "text-slate-400",
  "text-slate-500",
  "text-slate-600",
  "text-slate-700",
];

function controlClassName(className = "") {
  const classes = className
    .split(/\s+/)
    .filter(Boolean)
    .filter((item) => !inputTextColors.includes(item));

  return [...classes, "text-gray-800", "placeholder-gray-400"].join(" ");
}

export const FormInput = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<"input">
>(function FormInput({ className, ...props }, ref) {
  return <input ref={ref} {...props} className={controlClassName(className)} />;
});

export function FormTextarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return <textarea {...props} className={controlClassName(className)} />;
}

export function FormSelect({
  className,
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return <select {...props} className={controlClassName(className)} />;
}
