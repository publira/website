import type { ReactNode } from "react";

interface PhoneFrameProps {
  readonly children: ReactNode;
}

export const PhoneFrame = ({ children }: PhoneFrameProps) => (
  <div className="border-border bg-muted mx-auto max-w-xs rounded-xl border p-2.5">
    <div className="flex justify-center pb-2.5">
      <span aria-hidden="true" className="bg-border h-1 w-10 rounded-full" />
    </div>
    <div className="border-border bg-card overflow-hidden rounded-md border">
      {children}
    </div>
  </div>
);
