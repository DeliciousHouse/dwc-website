import { z } from "zod";

export const USStateCodeSchema = z
  .string()
  .length(2)
  .transform((s) => s.toUpperCase());

export const AddressSchema = z.object({
  name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: USStateCodeSchema,
  postalCode: z.string().min(5),
  country: z.literal("US").default("US"),
  phone: z.string().optional()
});

export type AddressInput = z.infer<typeof AddressSchema>;

