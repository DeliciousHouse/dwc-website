import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

export type ProductFormDefaults = {
  name?: string;
  slug?: string;
  description?: string | null;
  priceCents?: number;
  currency?: string;
  imageUrl?: string | null;
  inventoryOnHand?: number;
  isActive?: boolean;
};

export function ProductForm({
  title,
  description,
  action,
  submitLabel,
  defaults,
  slugRequired = true,
}: {
  title: string;
  description?: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaults?: ProductFormDefaults;
  slugRequired?: boolean;
}) {
  return (
    <form action={action} className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-black">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-zinc-600 dark:text-zinc-300">{description}</p> : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={defaults?.name ?? ""} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={defaults?.slug ?? ""}
            placeholder="e.g. pinot-noir-2022 (optional on create)"
            required={slugRequired}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" defaultValue={defaults?.description ?? ""} placeholder="Optional" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priceCents">Price (cents)</Label>
          <Input
            id="priceCents"
            name="priceCents"
            type="number"
            min={0}
            step={1}
            defaultValue={defaults?.priceCents ?? 0}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" name="currency" defaultValue={defaults?.currency ?? "USD"} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventoryOnHand">Inventory on hand</Label>
          <Input
            id="inventoryOnHand"
            name="inventoryOnHand"
            type="number"
            step={1}
            defaultValue={defaults?.inventoryOnHand ?? 0}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" name="imageUrl" defaultValue={defaults?.imageUrl ?? ""} placeholder="Optional" />
        </div>

        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={defaults?.isActive ?? true}
            className="size-4 rounded border border-zinc-300 bg-white dark:border-white/20 dark:bg-black"
          />
          Active (visible in shop)
        </label>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

