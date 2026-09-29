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

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-t border-[var(--nk-line)] bg-[var(--nk-bg-2)] py-20 sm:py-28 lg:py-36"
    >
      <div className="nk-container">
        <div className="max-w-3xl sm:mx-auto sm:text-center">
          <p className="nk-eyebrow">How claiming works</p>
          <h2 className="nk-h2 mt-4">
            From search
            <br className="hidden sm:block" /> to verified owner.
          </h2>
          <p className="nk-lead mt-4">
            We confirm ownership through your cafe&apos;s official Instagram,
            so only the real owner can change your listing.
          </p>
        </div>

        <ol className="relative mt-14 grid gap-10 sm:mt-20 lg:grid-cols-3 lg:gap-8">
          {/* Timeline rail: runs through the step dots on desktop. */}
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-[5px] hidden border-t border-dashed border-[var(--nk-sage)] lg:block"
          />
          {steps.map((step, index) => (
            <li key={step.title} className="relative">
              <span
                aria-hidden="true"
                className="relative block h-[11px] w-[11px] rounded-full bg-[var(--nk-green)] ring-4 ring-[var(--nk-bg-2)]"
              />
              <p className="nk-meta mt-6 text-[var(--nk-muted)]">
                Step {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-[20px] font-semibold leading-snug text-[var(--nk-ink)]">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-[var(--nk-body)]">
                {step.copy}
              </p>
              <div aria-hidden="true" className="mt-6 max-w-[320px]">
                {step.visual}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
