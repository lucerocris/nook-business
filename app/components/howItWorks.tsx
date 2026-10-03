import {
  ApprovedStepVisual,
  CodeStepVisual,
  SearchStepVisual,
} from "./landing/drawn-ui";

// Mirrors the real claim flow in app/claim/[cafeId] and claim-form.tsx:
// search → sign in → DM a code from the cafe's official Instagram → a
// superadmin approves in nook-admin. The code expires after 7 days.
const steps = [
  {
    title: "Find your cafe",
    copy: "Search for your cafe by name and pick it from the list. Sign in with Google or your email to start the claim.",
    visual: <SearchStepVisual />,
  },
  {
    title: "Send us your code",
    copy: "You'll get a verification code. Send it to @nook_cafefinder from your cafe's official Instagram account. We don't accept personal accounts.",
    visual: <CodeStepVisual />,
  },
  {
    title: "Get approved",
    copy: "Our team checks the message and approves your claim, and your owner portal opens. Your code stays valid for 7 days.",
    visual: <ApprovedStepVisual />,
  },
];

// Three columns under one heading. The steps are a real sequence, so they
// carry numerals, set large in the display face on the rule that ties them.
export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-b border-[var(--nk-line)] bg-[var(--nk-bg-2)] py-24 sm:py-32"
    >
      <div className="nk-container">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-20">
          <h2 className="nk-h2">From search to verified owner.</h2>
          <p className="max-w-[52ch] text-[17px] leading-relaxed text-[var(--nk-body)] lg:pt-3">
            We confirm ownership through your cafe&apos;s official Instagram,
            so only the real owner can change your listing.
          </p>
        </div>

        <ol className="mt-16 grid gap-12 sm:mt-20 lg:grid-cols-3 lg:gap-10">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t border-[var(--nk-ink)] pt-5">
              <p className="nk-display text-[3rem] leading-none text-[var(--nk-green)]">
                <span className="sr-only">Step </span>
                {index + 1}
              </p>
              <div aria-hidden="true" className="mt-8 flex max-w-[320px] flex-col lg:h-[132px]">
                {step.visual}
              </div>
              <h3 className="mt-8 text-[18px] font-semibold leading-snug text-[var(--nk-ink)]">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-[var(--nk-body)]">
                {step.copy}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
