"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import {
  submitListing,
  type DuplicateCafe,
  type ListingInput,
} from "@/actions/listings";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
// Cebu City: biases address suggestions toward where Nook's cafes are.
const PROXIMITY = "123.8854,10.3157";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-[#d4d4d0] bg-white px-3 py-2.5 text-base text-[var(--nk-ink)] outline-none transition-colors placeholder:text-[#8a8a87] focus:border-[var(--nk-green)] focus-visible:ring-2 focus-visible:ring-[var(--nk-green)]/25 sm:text-sm";
const labelClass = "text-sm font-medium text-[#101514]";

type Suggestion = {
  mapbox_id: string;
  name: string;
  place_formatted?: string;
  full_address?: string;
};

type MapboxContext = {
  neighborhood?: { name?: string };
  locality?: { name?: string };
  place?: { name?: string };
};

type Place = {
  address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
};

// Mapbox Search Box: /suggest while typing, /retrieve for the coordinates of
// the one picked. Both calls share a session token, which is what Mapbox bills
// on, so a fresh one is started after each pick.
function newSessionToken() {
  return crypto.randomUUID();
}

function useAddressSearch() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const session = useRef(newSessionToken());
  const latest = useRef(0);

  const suggest = async (query: string) => {
    const id = ++latest.current;
    if (!MAPBOX_TOKEN || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        access_token: MAPBOX_TOKEN,
        session_token: session.current,
        country: "ph",
        proximity: PROXIMITY,
        types: "poi,address,street",
        language: "en",
        limit: "6",
      });
      const res = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`
      );
      const json = await res.json();
      if (id === latest.current) setSuggestions(json.suggestions ?? []);
    } catch {
      if (id === latest.current) setSuggestions([]);
    } finally {
      if (id === latest.current) setLoading(false);
    }
  };

  const retrieve = async (suggestion: Suggestion): Promise<Place | null> => {
    if (!MAPBOX_TOKEN) return null;
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      session_token: session.current,
    });
    try {
      const res = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(suggestion.mapbox_id)}?${params}`
      );
      const json = await res.json();
      const feature = json.features?.[0];
      const [lng, lat] = feature?.geometry?.coordinates ?? [];
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      const props = feature.properties ?? {};
      const context: MapboxContext = props.context ?? {};
      return {
        address:
          props.full_address ??
          [props.name, props.place_formatted].filter(Boolean).join(", "),
        neighborhood: context.neighborhood?.name ?? context.locality?.name ?? "",
        city: context.place?.name ?? "",
        lat,
        lng,
      };
    } catch {
      return null;
    } finally {
      session.current = newSessionToken();
      setSuggestions([]);
    }
  };

  return { suggestions, loading, suggest, retrieve, clear: () => setSuggestions([]) };
}

function staticMapUrl(place: Place) {
  const at = `${place.lng},${place.lat}`;
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l+3a5a40(${at})/${at},16,0/640x280@2x?access_token=${MAPBOX_TOKEN}`;
}

export function ListCafeForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [addressQuery, setAddressQuery] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [neighborhood, setNeighborhood] = useState("");
  const [instagram, setInstagram] = useState("");
  const [role, setRole] = useState<ListingInput["role"]>("owner");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateCafe[] | null>(null);
  const [blocked, setBlocked] = useState<"already_pending" | "being_listed" | null>(null);
  const debounce = useRef<number | null>(null);
  const address = useAddressSearch();

  useEffect(
    () => () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    },
    []
  );

  const onAddressChange = (value: string) => {
    setAddressQuery(value);
    setPlace(null);
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => address.suggest(value), 250);
  };

  const pick = async (suggestion: Suggestion) => {
    setAddressQuery(suggestion.full_address ?? suggestion.name);
    const picked = await address.retrieve(suggestion);
    if (!picked) {
      setError("Couldn't load that address. Try another result.");
      return;
    }
    setError(null);
    setPlace(picked);
    setAddressQuery(picked.address);
    if (!neighborhood.trim() && picked.neighborhood) setNeighborhood(picked.neighborhood);
  };

  const submit = async (force: boolean) => {
    if (!place) {
      setError("Pick your cafe's address from the list so we can place it on the map.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await submitListing({
        name,
        address: place.address,
        neighborhood,
        city: place.city,
        lat: place.lat,
        lng: place.lng,
        instagram,
        role,
        force,
      });
      switch (result.status) {
        case "created":
          router.push("/claim/status");
          return;
        case "duplicates":
          setDuplicates(result.cafes);
          return;
        case "already_pending":
        case "being_listed":
          setBlocked(result.status);
          return;
        case "error":
          setError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(false);
  };

  if (blocked) {
    return (
      <div className="flex max-w-md flex-col gap-4">
        <p className="text-[16px] leading-relaxed text-[var(--nk-body)]">
          {blocked === "already_pending"
            ? "You already have a cafe waiting for review. Once it's verified you can add another."
            : "Someone has already submitted this cafe and it's being reviewed. If it's yours, message us on Instagram and we'll sort it out."}
        </p>
        {blocked === "already_pending" ? (
          <Link href="/claim/status" className="nk-btn nk-btn-primary min-h-11">
            Check your status
          </Link>
        ) : (
          <a
            href="https://instagram.com/nook_cafefinder"
            target="_blank"
            rel="noopener noreferrer"
            className="nk-btn nk-btn-primary min-h-11"
          >
            Message @nook_cafefinder
          </a>
        )}
      </div>
    );
  }

  if (duplicates) {
    return (
      <div className="max-w-xl">
        <p className="text-[16px] leading-relaxed text-[var(--nk-body)]">
          These cafes are already on Nook. If one of them is yours, claim it
          instead of adding it again.
        </p>
        <ul className="mt-6 border-t border-[var(--nk-line)]">
          {duplicates.map((cafe) => (
            <li
              key={cafe.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--nk-line)] py-4"
            >
              <span className="min-w-0">
                <span className="block font-semibold text-[var(--nk-ink)]">{cafe.name}</span>
                <span className="block text-sm text-[var(--nk-muted)]">
                  {cafe.address ?? "Address unavailable"}
                </span>
              </span>
              {cafe.is_claimed ? (
                <span className="text-sm text-[var(--nk-muted)]">Already has an owner</span>
              ) : (
                <Link href={`/claim/${cafe.id}`} className="nk-btn nk-btn-secondary">
                  This is mine
                </Link>
              )}
            </li>
          ))}
        </ul>
        {error && (
          <p role="alert" className="mt-4 text-sm text-[#b94a48]">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={submitting}
            className="nk-btn nk-btn-primary min-h-11"
          >
            {submitting ? <Spinner className="mr-2 size-4" /> : null}
            None of these, add {name.trim() || "my cafe"}
          </button>
          <button
            type="button"
            onClick={() => setDuplicates(null)}
            disabled={submitting}
            className="nk-btn nk-btn-secondary min-h-11"
          >
            Edit details
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="max-w-xl space-y-5" onSubmit={onSubmit} noValidate>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-[#b94a48]/30 bg-[#b94a48]/5 px-4 py-3 text-sm text-[#b94a48]"
        >
          {error}
        </p>
      )}

      <div>
        <label className={labelClass} htmlFor="cafe-name">
          Cafe name
        </label>
        <input
          id="cafe-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
          autoComplete="organization"
          className={inputClass}
        />
      </div>

      <div className="relative">
        <label className={labelClass} htmlFor="cafe-address">
          Address
        </label>
        <input
          id="cafe-address"
          value={addressQuery}
          onChange={(e) => onAddressChange(e.target.value)}
          onBlur={() => window.setTimeout(address.clear, 150)}
          placeholder="Search your cafe or street"
          autoComplete="off"
          role="combobox"
          aria-expanded={address.suggestions.length > 0}
          aria-controls="cafe-address-options"
          aria-describedby="cafe-address-hint"
          className={inputClass}
        />
        <p id="cafe-address-hint" className="mt-2 text-xs text-[var(--nk-muted)]">
          {MAPBOX_TOKEN
            ? "Pick a result so we can place your cafe on the map."
            : "Address search isn't available right now. Message us on Instagram to list your cafe."}
        </p>
        {address.suggestions.length > 0 && (
          <ul
            id="cafe-address-options"
            role="listbox"
            className="absolute left-0 right-0 z-30 mt-1 max-h-72 overflow-auto rounded-lg border border-[#d4d4d0] bg-white py-1 text-sm shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
          >
            {address.suggestions.map((s) => (
              <li key={s.mapbox_id} role="option" aria-selected={false}>
                <button
                  type="button"
                  // mousedown, not click: the input's blur would close the list first.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(s);
                  }}
                  className="flex w-full flex-col items-start px-3 py-2.5 text-left hover:bg-[#e3ebe4]/50"
                >
                  <span className="font-medium text-[#101514]">{s.name}</span>
                  <span className="text-xs text-[#6b6b6b]">
                    {s.full_address ?? s.place_formatted}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {place && MAPBOX_TOKEN && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={staticMapUrl(place)}
            alt={`Map pin at ${place.address}`}
            className="mt-3 aspect-[16/7] w-full rounded-lg border border-[var(--nk-line)] object-cover"
          />
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="cafe-neighborhood">
          Neighborhood <span className="font-normal text-[var(--nk-muted)]">(optional)</span>
        </label>
        <input
          id="cafe-neighborhood"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          maxLength={80}
          placeholder="e.g. IT Park, Banilad"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="cafe-instagram">
          Cafe&apos;s Instagram
        </label>
        <input
          id="cafe-instagram"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          maxLength={31}
          required
          placeholder="@yourcafe"
          autoCapitalize="none"
          autoCorrect="off"
          aria-describedby="cafe-instagram-hint"
          className={inputClass}
        />
        <p id="cafe-instagram-hint" className="mt-2 text-xs text-[var(--nk-muted)]">
          You&apos;ll verify by sending us a code from this account.
        </p>
      </div>

      <fieldset>
        <legend className={labelClass}>Your role</legend>
        <div className="mt-2 flex gap-5">
          {(["owner", "manager"] as const).map((value) => (
            <label key={value} className="flex items-center gap-2 text-sm text-[var(--nk-body)]">
              <input
                type="radio"
                name="role"
                value={value}
                checked={role === value}
                onChange={() => setRole(value)}
                className="accent-[#3A5A40]"
              />
              {value === "owner" ? "Owner" : "Manager"}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={submitting || !MAPBOX_TOKEN}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#3A5A40] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2f4833] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? <Spinner className="mr-2 size-4" /> : null}
        Continue to verification
      </button>
    </form>
  );
}
