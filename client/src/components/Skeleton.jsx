export function WeekSkeletons() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-[26px] bg-white p-5 shadow-card"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-2.5 w-20 rounded-full bg-line" />
              <div className="h-4 w-32 rounded-full bg-line" />
            </div>
            <div className="h-8 w-8 rounded-full bg-line" />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="h-3 w-28 rounded-full bg-line" />
            <div className="h-3 w-14 rounded-full bg-line" />
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-line" />
        </div>
      ))}
    </div>
  );
}
