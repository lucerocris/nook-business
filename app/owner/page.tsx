import { redirect } from "next/navigation";

// /owner has no content of its own — send owners to their dashboard.
export default function OwnerIndex() {
  redirect("/owner/dashboard");
}
