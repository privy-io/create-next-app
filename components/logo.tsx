import React from "react";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 18, height = 18 }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 163 179"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M28 0H129V13H28V0Z" fill="currentColor" />
      <path d="M129 13H149V26H129V13Z" fill="currentColor" />
      <path d="M129 71H149V84H129V71Z" fill="currentColor" />
      <path d="M96 84H129V97H96V84Z" fill="currentColor" />
      <path d="M63 84H96V97H63V84Z" fill="currentColor" />
      <path d="M14 13H28V26H14V13Z" fill="currentColor" />
      <path d="M149 26H163V71H149V26Z" fill="currentColor" />
      <path d="M0 26H14V153H0V26Z" fill="currentColor" />
      <path d="M49 71H63V84H49V71Z" fill="currentColor" />
      <path d="M71 49H85V62H71V49Z" fill="currentColor" />
      <path d="M49 166H96V179H49V166Z" fill="currentColor" />
      <path d="M14 153H49V166H14V153Z" fill="currentColor" />
      <path d="M110 49H124V62H110V49Z" fill="currentColor" />
      <path d="M96 87H110V166H96V87Z" fill="currentColor" />
    </svg>
  );
}
