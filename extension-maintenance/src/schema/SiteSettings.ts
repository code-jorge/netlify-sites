import { z } from "zod";

export const SiteSettingsSchema = z.object({
  enabled: z.boolean(),
  reason: z.string().min(1),
});