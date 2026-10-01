// Catalog figures only. As of 2026-09-29 the shared `cafes` table holds 55
// rows (35 in Cebu City) and `tags` holds 28. Round down when updating, and
// never cite user-side counts here: most accounts are test accounts.
// "Free" rather than "₱0": Poppins has no peso glyph, so it falls back to a
// serif at display size.
const STATS = [
  {
    value: "50+",
    label: "cafes listed across Metro Cebu, from Cebu City to Lapu-Lapu",
  },
  {
    value: "28",
    label: "tags people filter by, from Free WiFi to Late Night",
  },
  {
    value: "Free",
    label: "to claim your cafe and keep its listing up to date",
  },
];

export default function ProofStrip() {
  return (
    <section
      aria-label="Nook in numbers"
      className="mt-0 border-y border-[var(--nk-line)] bg-nk-bg"
    >
      <div className="nk-container grid grid-cols-1 divide-y divide-[var(--nk-line)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {STATS.map((stat) => (
          <div key={stat.value} className="py-7 sm:px-8 sm:py-10 sm:first:pl-0">
            <p className="text-[2rem] font-semibold leading-none tracking-[-0.02em] text-[var(--nk-ink)] sm:text-[2.5rem]">
              {stat.value}
            </p>
            <p className="mt-3 max-w-[30ch] text-[15px] leading-snug text-[var(--nk-body)]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
