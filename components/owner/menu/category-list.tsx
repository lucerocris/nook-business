"use client"

import { PencilSimple, Plus, SealCheck, Tag, Trash } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import type { Category } from "./types"

function countLabel(n: number) {
  return `${n} ${n === 1 ? "item" : "items"}`
}

function Row({
  name,
  count,
  icon: Icon,
  selected,
  onSelect,
  actions,
}: {
  name: string
  count: number
  icon?: React.ElementType
  selected: boolean
  onSelect: () => void
  actions?: React.ReactNode
}) {
  return (
    <li
      className={cn(
        "group/row flex items-center gap-1 border-l-2 pr-2",
        selected ? "border-foreground bg-muted" : "border-transparent hover:bg-muted/50"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-3.5 text-left outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
        <span className="grid min-w-0 leading-tight">
          <span className={cn("truncate text-sm", selected && "font-medium")}>{name}</span>
          <span className="text-xs text-muted-foreground tabular-nums">{countLabel(count)}</span>
        </span>
      </button>
      {actions}
    </li>
  )
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <li
      role="presentation"
      className="px-4 pt-4 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
    >
      {children}
    </li>
  )
}

export function CategoryList({
  categories,
  counts,
  total,
  selectedId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: {
  categories: Category[]
  counts: Map<string, number>
  total: number
  selectedId: string | null
  onSelect: (id: string | null) => void
  onAdd: () => void
  onRename: (category: Category) => void
  onDelete: (id: string) => void
}) {
  // Nook's shared list is long and mostly unused by any one café; only the
  // ones this café actually files items under are worth filtering by.
  // The selected one stays visible even after its last item moves out.
  const nook = categories.filter(
    (c) => c.is_global && ((counts.get(c.id) ?? 0) > 0 || c.id === selectedId)
  )
  const yours = categories.filter((c) => !c.is_global)

  return (
    <section aria-labelledby="categories-heading" className="rounded-xl border bg-card pb-3">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <h2 id="categories-heading" className="text-[15px] font-semibold">
            Categories
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Pick one to show only its items.</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="-mr-1 inline-flex min-h-8 shrink-0 items-center gap-1 rounded-md px-1 text-[13px] font-medium outline-hidden hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-3.5" aria-hidden />
          Add
        </button>
      </div>

      <ul className="mt-3">
        <Row
          name="All items"
          count={total}
          selected={selectedId === null}
          onSelect={() => onSelect(null)}
        />
        {nook.length > 0 && <GroupLabel>From Nook</GroupLabel>}
        {nook.map((c) => (
          <Row
            key={c.id}
            name={c.name}
            count={counts.get(c.id) ?? 0}
            icon={SealCheck}
            selected={selectedId === c.id}
            onSelect={() => onSelect(c.id)}
          />
        ))}
        <GroupLabel>Yours</GroupLabel>
        {yours.length === 0 ? (
          <li className="px-4 py-1.5 text-xs text-muted-foreground">
            None yet. Add one for things like seasonal drinks.
          </li>
        ) : (
          yours.map((c) => (
            <Row
              key={c.id}
              name={c.name}
              count={counts.get(c.id) ?? 0}
              icon={Tag}
              selected={selectedId === c.id}
              onSelect={() => onSelect(c.id)}
              actions={
                <span className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => onRename(c)}
                    aria-label={`Rename ${c.name}`}
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground outline-hidden hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <PencilSimple className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    aria-label={`Delete ${c.name}`}
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground outline-hidden hover:bg-background hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Trash className="size-4" aria-hidden />
                  </button>
                </span>
              }
            />
          ))
        )}
      </ul>

      <p className="mt-3 flex gap-1.5 px-4 text-xs leading-relaxed text-muted-foreground">
        <SealCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Nook categories are shared by every café and can’t be renamed.
      </p>
    </section>
  )
}
