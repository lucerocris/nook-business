const INSTAGRAM_URL = "https://instagram.com/nook_cafefinder";
const SUPPORT_URL = "https://privacy.nookph.app/support.html";

// Answers must match what ships. Premium photo slots are mentioned in the
// owner portal as a future option, which is why "free" is scoped to the
// core listing and not promised forever.
const faqs = [
  {
    q: "Does it cost anything?",
    a: "No. Claiming your cafe and managing your listing is free. Some extras, like more photo slots, may come later as optional upgrades.",
  },
  {
    q: "How do you check that I own the cafe?",
    a: "After you start a claim, we give you a verification code. Send it to @nook_cafefinder from your cafe's official Instagram account. Our team matches the code to your claim and approves it. Messages from personal accounts aren't accepted.",
  },
  {
    q: "How long does approval take?",
    a: "A person on our team reviews every claim after your message arrives. You can check progress anytime on the claim status page. Your code stays valid for 7 days, so there's no rush to send it.",
  },
  {
    q: "My cafe isn't on Nook. Can I add it?",
    a: "Yes. Search for it above, and if it isn't there, choose \"Add your cafe to Nook\". You'll give its name, address and Instagram, then verify it's yours the same way as a claim. It stays hidden until you've set up your page and we've published it.",
  },
  {
    q: "What can I change once I'm approved?",
    a: "Your cafe's name, description, daily hours, closed days and social links; your menu with prices; your photos; and your tags. For a wrong address or map pin, send a correction from the Edit Listing page and our team will fix it.",
  },
  {
    q: "Can I remove a bad review?",
    a: "No. Reviews belong to the people who wrote them. If a review breaks the rules, report it from your Reviews page and our team will look at it.",
  },
  {
    q: "Where does my listing appear?",
    a: "On the Nook website at nookph.app and in the Nook iPhone app, where people search, filter by tags and browse the map.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-b border-[var(--nk-line)] bg-white py-24 sm:py-32">
      <div className="nk-container grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="nk-h2">Questions owners ask.</h2>

          <div className="mt-10 border-t border-[var(--nk-ink)] pt-6">
            <p className="text-[16px] font-semibold text-[var(--nk-ink)]">
              Can&apos;t find your answer?
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--nk-body)]">
              Message the Nook team on Instagram. It&apos;s the same account
              you&apos;ll send your verification code to.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="nk-btn nk-btn-primary"
              >
                Message @nook_cafefinder
              </a>
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="nk-link"
              >
                Merchant support
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--nk-ink)]">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="nk-faq group border-b border-[var(--nk-line)]"
            >
              <summary className="flex cursor-pointer items-center gap-4 py-5 text-[16px] font-medium text-[var(--nk-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nk-green)] sm:py-6 sm:text-[17px]">
                <span className="flex-1">{item.q}</span>
                <span
                  aria-hidden="true"
                  className="nk-plus text-[24px] font-light leading-none text-[var(--nk-green)]"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[62ch] pb-6 text-[15px] leading-relaxed text-[var(--nk-body)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
