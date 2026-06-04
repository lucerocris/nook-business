import type { Metadata } from "next"

export const metadata: Metadata = { title: "Claim your cafe" }

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
