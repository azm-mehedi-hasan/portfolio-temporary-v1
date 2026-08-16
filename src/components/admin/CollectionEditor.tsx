"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/actions/helpers";
import { ICON_NAMES, getIcon } from "@/lib/icons";
import { Button, Card, EmptyState, Field, Input, Textarea } from "./ui";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "url" | "textarea" | "checkbox" | "icon" | "lines";
  placeholder?: string;
  hint?: string;
  full?: boolean;
};

export type CollectionItem = Record<string, any> & { id: string };

type Props = {
  items: CollectionItem[];
  fields: FieldDef[];
  /** Row summary shown when collapsed. */
  primaryKey: string;
  secondaryKey?: string;
  imageKey?: string;
  iconKey?: string;
  addLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  defaults?: Record<string, any>;
  // Server Action references, passed straight from a Server Component.
  onSave: (values: Record<string, any>) => Promise<ActionResult<any>>;
  onDelete: (input: { id: string }) => Promise<ActionResult<any>>;
  onReorder: (input: { ids: string[] }) => Promise<ActionResult<any>>;
};

export function CollectionEditor({
  items: initialItems,
  fields,
  primaryKey,
  secondaryKey,
  imageKey,
  iconKey,
  addLabel,
  emptyTitle,
  emptyDescription,
  defaults = {},
  onSave,
  onDelete,
  onReorder,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [, startTransition] = useTransition();

  // Re-sync when the Server Component re-renders after router.refresh(), so a
  // newly created row appears without a manual reload.
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);

    startTransition(async () => {
      const result = await onReorder({ ids: next.map((i) => i.id) });
      if (!result.ok) {
        toast.error(result.error);
        setItems(items);
      }
    });
  }

  async function handleSave(values: Record<string, any>, id?: string) {
    const result = await onSave({ ...values, id });
    if (result.ok) {
      toast.success(result.message ?? "Saved");
      setEditingId(null);
      setCreating(false);
      router.refresh();
      return true;
    }
    toast.error(result.error);
    return false;
  }

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    const previous = items;
    setItems(items.filter((i) => i.id !== id));
    const result = await onDelete({ id });
    if (result.ok) {
      toast.success(result.message ?? "Deleted");
      router.refresh();
    } else {
      toast.error(result.error);
      setItems(previous);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <SortableRow
                key={item.id}
                item={item}
                fields={fields}
                primaryKey={primaryKey}
                secondaryKey={secondaryKey}
                imageKey={imageKey}
                iconKey={iconKey}
                isEditing={editingId === item.id}
                onEdit={() => setEditingId(editingId === item.id ? null : item.id)}
                onSave={(values) => handleSave(values, item.id)}
                onDelete={() => handleDelete(item.id, String(item[primaryKey]))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && !creating && (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={<Button onClick={() => setCreating(true)}>{addLabel}</Button>}
        />
      )}

      {creating ? (
        <Card className="p-4">
          <ItemForm
            fields={fields}
            values={defaults}
            onCancel={() => setCreating(false)}
            onSubmit={(values) => handleSave(values)}
          />
        </Card>
      ) : (
        items.length > 0 && (
          <div>
            <Button variant="secondary" onClick={() => setCreating(true)}>
              {addLabel}
            </Button>
          </div>
        )
      )}
    </div>
  );
}

function SortableRow({
  item,
  fields,
  primaryKey,
  secondaryKey,
  imageKey,
  iconKey,
  isEditing,
  onEdit,
  onSave,
  onDelete,
}: {
  item: CollectionItem;
  fields: FieldDef[];
  primaryKey: string;
  secondaryKey?: string;
  imageKey?: string;
  iconKey?: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (values: Record<string, any>) => Promise<boolean>;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const Icon = iconKey ? getIcon(item[iconKey]) : null;

  return (
    <div
      ref={setNodeRef}
      data-testid="collection-row"
      data-row-name={String(item[primaryKey] ?? "")}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <Card className={isDragging ? "opacity-60 shadow-md" : undefined}>
        <div className="flex items-center gap-3 p-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 active:cursor-grabbing"
            aria-label={`Reorder ${item[primaryKey]}`}
          >
            <IconGripVertical className="h-4 w-4" />
          </button>

          {imageKey && item[imageKey] ? (
            <Image
              src={item[imageKey]}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded object-cover ring-1 ring-neutral-200"
            />
          ) : Icon ? (
            <Icon className="h-5 w-5 shrink-0 text-neutral-500" />
          ) : null}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">
              {item[primaryKey] || "Untitled"}
            </p>
            {secondaryKey && item[secondaryKey] ? (
              <p className="truncate text-xs text-neutral-500">
                {item[secondaryKey]}
              </p>
            ) : null}
          </div>

          {"visible" in item && !item.visible && (
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
              Hidden
            </span>
          )}

          <Button variant="ghost" size="sm" onClick={onEdit}>
            {isEditing ? "Close" : "Edit"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:bg-red-50">
            Delete
          </Button>
        </div>

        {isEditing && (
          <div className="border-t border-neutral-100 p-4">
            <ItemForm fields={fields} values={item} onCancel={onEdit} onSubmit={onSave} />
          </div>
        )}
      </Card>
    </div>
  );
}

function ItemForm({
  fields,
  values,
  onSubmit,
  onCancel,
}: {
  fields: FieldDef[];
  values: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [state, setState] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    for (const f of fields) {
      const v = values[f.name];
      initial[f.name] =
        f.type === "checkbox"
          ? v ?? true
          : f.type === "lines"
          ? Array.isArray(v)
            ? v.join("\n")
            : ""
          : v ?? "";
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload: Record<string, any> = {};
    for (const f of fields) {
      payload[f.name] =
        f.type === "lines"
          ? String(state[f.name] || "")
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : state[f.name];
    }
    await onSubmit(payload);
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.full || f.type !== "text" ? "sm:col-span-2" : ""}>
            {f.type === "checkbox" ? (
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={Boolean(state[f.name])}
                  onChange={(e) =>
                    setState({ ...state, [f.name]: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-neutral-300"
                />
                {f.label}
              </label>
            ) : f.type === "icon" ? (
              <Field label={f.label} hint={f.hint}>
                <IconPicker
                  value={String(state[f.name] || ICON_NAMES[0])}
                  onChange={(v) => setState({ ...state, [f.name]: v })}
                />
              </Field>
            ) : f.type === "textarea" || f.type === "lines" ? (
              <Field label={f.label} hint={f.hint}>
                <Textarea
                  rows={f.type === "lines" ? 5 : 8}
                  value={state[f.name]}
                  placeholder={f.placeholder}
                  onChange={(e) => setState({ ...state, [f.name]: e.target.value })}
                />
              </Field>
            ) : (
              <Field label={f.label} hint={f.hint}>
                <Input
                  value={state[f.name]}
                  placeholder={f.placeholder}
                  onChange={(e) => setState({ ...state, [f.name]: e.target.value })}
                />
              </Field>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const matches = ICON_NAMES.filter((n) =>
    n.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search icons..."
      />
      <div className="grid max-h-40 grid-cols-6 gap-1 overflow-y-auto rounded-md border border-neutral-200 p-2 sm:grid-cols-10">
        {matches.map((name) => {
          const Icon = getIcon(name);
          return (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => onChange(name)}
              aria-pressed={value === name}
              className={`flex h-9 items-center justify-center rounded ${
                value === name
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
      <p className="text-xs text-neutral-500">
        Selected: <span className="font-mono">{value}</span>
      </p>
    </div>
  );
}
