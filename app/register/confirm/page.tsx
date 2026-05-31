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
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
        <p className="mt-3 text-sm text-gray-500">
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
        <p className="mt-4 text-sm text-gray-500">
          You can close this tab after confirming your email.
        </p>
      </div>
    </div>
  );
}
