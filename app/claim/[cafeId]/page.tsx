import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimForm } from "@/app/components/claim/claim-form";

type ClaimPageProps = {
  params: Promise<{
    cafeId: string;
  }>;
};

type CafeRecord = {
  id: string | number;
  name: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  featured_image_url: string | null;
  is_claimed: boolean | null;
};

export default async function ClaimPage({ params }: ClaimPageProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { cafeId } = await params;

  const { data: cafe, error } = await supabase
    .from("cafes")
    .select(
      "id, name, address, neighborhood, city, featured_image_url, is_claimed"
    )
    .eq("id", cafeId)
    .maybeSingle<CafeRecord>();

  if (error || !cafe || cafe.is_claimed) {
    notFound();
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  const redirectPath = encodeURIComponent(`/claim/${cafeId}`);

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          {cafe.featured_image_url ? (
            <img
              src={cafe.featured_image_url}
              alt={cafe.name ?? "Cafe"}
              className="mx-auto mb-6 h-20 w-20 rounded-xl object-cover"
            />
          ) : null}
          <h1 className="text-3xl font-bold text-gray-900">
            Claim {cafe.name ?? "this cafe"}
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Create a free business account to manage {cafe.name ?? "this cafe"}
            on Nook.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href={`/register?redirect=${redirectPath}`}
              className="inline-flex w-full items-center justify-center rounded-md bg-[#3A5A40] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2b442f]"
            >
              Create free account
            </Link>
            <Link
              href={`/login?redirect=${redirectPath}`}
              className="text-sm font-semibold text-[#3A5A40] hover:text-[#2b442f]"
            >
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: existingClaim } = await supabase
    .from("cafe_claims")
    .select("id, verification_code, status")
    .eq("cafe_id", cafeId)
    .eq("claimant_id", user.id)
    .in("status", ["pending", "under_review"])
    .maybeSingle<{
      id: string;
      verification_code: string | null;
      status: string;
    }>();

  return (
    <ClaimForm
      cafeId={String(cafe.id)}
      cafeName={cafe.name ?? "this cafe"}
      userId={user.id}
      existingClaim={existingClaim}
    />
  );
}
