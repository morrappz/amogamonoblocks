import { z } from "zod";

export const createStoryMakerSchema = z.object({
  story_title: z.string().min(1, "required"),
  story_description: z.string().min(1, "required"),
  story_group: z.string().min(1, "required"),
  story_template: z.string().min(1, "required"),
  status: z.string().min(1, "required"),
});

export type CreateStoryMakerSchema = z.infer<typeof createStoryMakerSchema>;
