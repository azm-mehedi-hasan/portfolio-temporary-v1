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
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteProject, reorderProjects } from "@/lib/actions/content";
import { Button, Card, StatusPill } from "./ui";

type Row = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  status: "DRAFT" | "PUBLISHED";
  techCount: number;
  imageCount: number;
};

export function ProjectList({ projects }: { projects: Row[] }) {
  const [items, setItems] = useState(projects);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const next = arrayMove(
      items,
      items.findIndex((i) => i.id === active.id),
      items.findIndex((i) => i.id === over.id)
    );
    const previous = items;
    setItems(next);
    startTransition(async () => {
      const result = await reorderProjects({ ids: next.map((i) => i.id) });
      if (!result.ok) {
        toast.error(result.error);
        setItems(previous);
      }
    });
  }

  async function handleDelete(row: Row) {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    const previous = items;
    setItems(items.filter((i) => i.id !== row.id));
    const result = await deleteProject({ id: row.id });
    if (result.ok) toast.success(result.message ?? "Deleted");
    else {
      toast.error(result.error);
      setItems(previous);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {items.map((row) => (
            <SortableProject key={row.id} row={row} onDelete={() => handleDelete(row)} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableProject({ row, onDelete }: { row: Row; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });

  return (
    <div
      ref={setNodeRef}
      data-testid="project-row"
      data-row-slug={row.slug}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <Card className={isDragging ? "opacity-60 shadow-md" : undefined}>
        <div className="flex items-center gap-3 p-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none rounded p-1 text-neutral-400 hover:bg-neutral-100 active:cursor-grabbing"
            aria-label={`Reorder ${row.title}`}
          >
            <IconGripVertical className="h-4 w-4" />
          </button>

          <Image
            src={row.thumbnailUrl}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded object-cover ring-1 ring-neutral-200"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-neutral-900">{row.title}</p>
              <StatusPill status={row.status} />
            </div>
            <p className="truncate text-xs text-neutral-500">{row.description}</p>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              /{row.slug} &middot; {row.techCount} tech &middot; {row.imageCount} images
            </p>
          </div>

          <Link href={`/projects/${row.slug}`} target="_blank">
            <Button variant="ghost" size="sm">View</Button>
          </Link>
          <Link href={`/admin/projects/${row.id}`}>
            <Button variant="secondary" size="sm">Edit</Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:bg-red-50">
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}
