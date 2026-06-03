import { FunnelShell } from "@/app/components/funnel-shell";

type RegisterConfirmPageProps = {
  searchParams?: Promise<{
    email?: string;
  }>;
};

export default async function RegisterConfirmPage({
  searchParams,
}: RegisterConfirmPageProps) {
  const { email } = (await searchParams) ?? {};
  const trimmedEmail = email?.trim();

  return (
    <FunnelShell contentClassName="max-w-4xl">
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-sm sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3A5A40]/10 text-xs font-semibold uppercase tracking-[0.28em] text-[#3A5A40] animate-funnel-rise">
          Mail
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40] animate-funnel-fade funnel-delay-1">
          Registration complete
        </p>

        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-gray-900 animate-funnel-rise funnel-delay-2 sm:text-4xl">
          Check your email
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm text-gray-600 animate-funnel-fade funnel-delay-3 sm:text-base">
          {trimmedEmail ? (
            <>
              We sent a confirmation link to{" "}
              <span className="font-semibold text-gray-900">{trimmedEmail}</span>.
            </>
          ) : (
            <>We sent a confirmation link to your email.</>
          )}{" "}
          Click it to finish setting up your account.
        </p>

        <p className="mt-4 text-sm text-gray-500 animate-funnel-fade funnel-delay-3">
          You can close this tab after confirming your email.
        </p>
      </div>
    </FunnelShell>
  );
}
