export function Spinner({ className = "" }: { className?: string }) {
  return <div className={`loader-spinner ${className}`} />;
}

export function SpinnerSm({ className = "" }: { className?: string }) {
  return <div className={`loader-spinner-sm ${className}`} />;
}

export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Spinner />
      <p className="text-sm text-[#999] animate-pulse">{text}</p>
    </div>
  );
}

export function TableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-shimmer rounded-sm" style={{ height: rows * 52 + 44 }}>
      <div className="h-11 bg-[#f5f5f5]/50" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-[52px] border-t border-[#ebebeb]/50" />
      ))}
    </div>
  );
}
