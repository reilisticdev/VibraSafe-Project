export default function Footer() {
  return (
    <footer className="border-t border-line-soft">
      <div className="gc-section flex flex-col gap-8 !py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #f5a524, #38d9e8)" }}
            aria-hidden
          />
          <span className="font-display text-sm font-semibold tracking-tight text-ink">
            VibraSafe
          </span>
        </div>

        <p className="max-w-md text-xs leading-relaxed text-faint">
          Prevalence and demographic figures sourced from the WHO World
          Report on Hearing (2021) and South African census data, framed as
          any degree of hearing loss (mild to total). Hardware
          specifications reflect real, sourceable components.
        </p>

        <p className="text-xs text-faint">
          © {new Date().getFullYear()} VibraSafe — ESKOM Science Expo
        </p>
      </div>
    </footer>
  );
}
