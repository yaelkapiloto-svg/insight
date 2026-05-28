import { clsx } from "clsx";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("bg-white rounded-2xl border border-[#e2e8f0] p-5", className)}>
      {children}
    </div>
  );
}
