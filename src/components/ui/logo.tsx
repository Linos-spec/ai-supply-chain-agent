"use client";

import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
  size?: number;
}

/**
 * Supply Chain Agent logo — a stylized network graph with
 * interconnected nodes representing supply chain flow,
 * with a central AI "hub" node.
 */
export function LogoIcon({ className, size = 24 }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    >
      {/* Connection lines (supply chain links) */}
      <path
        d="M14 12L24 24M34 12L24 24M24 24L12 36M24 24L36 36M24 24V8M24 24L40 24M24 24L8 24M24 24V40"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* Flow arrows on paths */}
      {/* Top-left flow */}
      <path
        d="M17 16L15.5 14.5L16.5 13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      {/* Top-right flow */}
      <path
        d="M31 16L32.5 14.5L31.5 13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />

      {/* Outer nodes — supply chain endpoints */}
      {/* Top (Supplier) */}
      <rect
        x="20"
        y="4"
        width="8"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M22 8H26M24 6.5V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

      {/* Left (Warehouse) */}
      <rect
        x="4"
        y="20"
        width="8"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M6.5 24H11.5M6.5 26H9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7" />

      {/* Right (Distribution) */}
      <rect
        x="36"
        y="20"
        width="8"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M38.5 23L41.5 24L38.5 25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

      {/* Bottom (Customer/Demand) */}
      <rect
        x="20"
        y="36"
        width="8"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M23 39.5L25 41.5L23 43.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />

      {/* Top-left (Sourcing) */}
      <circle cx="14" cy="12" r="3.5" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.5" />

      {/* Top-right (Planning) */}
      <circle cx="34" cy="12" r="3.5" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.5" />

      {/* Bottom-left (Logistics) */}
      <circle cx="12" cy="36" r="3.5" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.5" />

      {/* Bottom-right (Fulfillment) */}
      <circle cx="36" cy="36" r="3.5" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.5" />

      {/* Central AI Hub — the "Agent" */}
      <circle cx="24" cy="24" r="7" fill="currentColor" opacity="0.9" />
      {/* AI circuit pattern inside hub */}
      <circle cx="24" cy="24" r="3" stroke="white" strokeWidth="1.2" fill="none" opacity="0.9" />
      <circle cx="24" cy="24" r="1.2" fill="white" opacity="0.9" />
      {/* Radiating dots on inner circle */}
      <circle cx="24" cy="21" r="0.8" fill="white" opacity="0.8" />
      <circle cx="24" cy="27" r="0.8" fill="white" opacity="0.8" />
      <circle cx="21" cy="24" r="0.8" fill="white" opacity="0.8" />
      <circle cx="27" cy="24" r="0.8" fill="white" opacity="0.8" />

      {/* Pulse ring around central hub */}
      <circle
        cx="24"
        cy="24"
        r="9.5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.2"
        strokeDasharray="3 3"
      />
    </svg>
  );
}

/**
 * Full logo with text — for larger placements.
 */
export function LogoFull({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
        <LogoIcon size={22} className="text-white" />
      </div>
      <div>
        <h1 className="text-base font-bold text-gray-900 dark:text-white">SC Agent</h1>
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Supply Chain AI
        </p>
      </div>
    </div>
  );
}
