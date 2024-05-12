import { z } from "zod";

export const chatMessageSchema = z.object({
  id: z.string().cuid2(),
  as: z.enum(["john", "melissa"]),
  content: z.string(),
  readAt: z.string().nullish(),
  createdAt: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
