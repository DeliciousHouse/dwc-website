"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function readString(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function readOptional(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();
  return value.length ? value : null;
}

export async function createAddressAction(formData: FormData) {
  const session = await requireUser();
  const name = readString(formData, "name");
  const phone = readOptional(formData, "phone");
  const line1 = readString(formData, "line1");
  const line2 = readOptional(formData, "line2");
  const city = readString(formData, "city");
  const state = readString(formData, "state").toUpperCase();
  const postalCode = readString(formData, "postalCode");

  if (!name || !line1 || !city || !state || !postalCode) return;

  await getPrisma().address.create({
    data: {
      userId: session.user.id,
      name,
      phone,
      line1,
      line2,
      city,
      state,
      postalCode,
      country: "US",
    },
  });

  revalidatePath("/account");
}

export async function updateAddressAction(formData: FormData) {
  const session = await requireUser();
  const id = readString(formData, "addressId");
  const name = readString(formData, "name");
  const phone = readOptional(formData, "phone");
  const line1 = readString(formData, "line1");
  const line2 = readOptional(formData, "line2");
  const city = readString(formData, "city");
  const state = readString(formData, "state").toUpperCase();
  const postalCode = readString(formData, "postalCode");

  if (!id || !name || !line1 || !city || !state || !postalCode) return;

  await getPrisma().address.update({
    where: { id, userId: session.user.id },
    data: {
      name,
      phone,
      line1,
      line2,
      city,
      state,
      postalCode,
    },
  });

  revalidatePath("/account");
}

export async function deleteAddressAction(formData: FormData) {
  const session = await requireUser();
  const id = readString(formData, "addressId");
  if (!id) return;

  await getPrisma().address.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/account");
}

export async function setDefaultAddressAction(formData: FormData) {
  const session = await requireUser();
  const id = readString(formData, "addressId");
  if (!id) return;

  const prisma = getPrisma();
  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id, userId: session.user.id },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/account");
}
