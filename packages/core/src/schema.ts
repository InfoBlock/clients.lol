import { z } from "zod";

const nonEmpty = 1;

export const Features = z
  .object({
    crashers: z.boolean().default(false),
    esp: z.boolean().default(false),
    movement: z.boolean().default(false),
    protections: z.boolean().default(false),
    teleports: z.boolean().default(false),
    vr: z.boolean().default(false),
  })
  .strict();

export const Client = z
  .object({
    access: z.enum(["Free", "Invite", "Paid"]),
    features: Features,
    id: z.string(),
    name: z.string().min(nonEmpty),
    os: z.string().min(nonEmpty),
    staffQuality: z.enum(["Excellent", "Good", "Average", "Poor", "Unknown"]),
    status: z.enum(["Active", "Inactive", "Discontinued", "Unknown"]),
    type: z.string().min(nonEmpty),
    website: z.string().url().optional(),
  })
  .strict();

export type Client = z.infer<typeof Client>;
