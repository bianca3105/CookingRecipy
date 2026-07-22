import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const OrganizedRecipeSchema = z.object({
  isRecipe: z.boolean(),
  name: z.string().nullable(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
  servings: z.string().nullable(),
  totalTime: z.string().nullable(),
});

export type OrganizedRecipe = z.infer<typeof OrganizedRecipeSchema>;

const PROMPT = (text: string) => `Organize the following text into a structured recipe. The text may be messy — a social media caption, hashtags, emojis, run-on sentences — and may be in any language; keep the original language. Extract:
- name: a short recipe title (not the whole text)
- ingredients: one item per entry, in the order mentioned
- steps: one step per entry, in a sensible cooking order (infer the order if the text doesn't lay it out step by step)
- servings / totalTime: only if actually mentioned, as free text (e.g. "4 porciones", "30 min")

If the text isn't describing a recipe at all, set isRecipe to false and leave the other fields null/empty.

Text:
"""
${text}
"""`;

/** Pure text-in/text-out — no network fetch, so it works regardless of any
 * site's bot-blocking. Used both for the "paste a paragraph" entry mode and
 * to turn a raw video caption into structured ingredients/steps. */
export async function organizeRecipeText(text: string): Promise<OrganizedRecipe | null> {
  const client = new Anthropic();

  let response;
  try {
    response = await client.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: zodOutputFormat(OrganizedRecipeSchema),
      },
      messages: [{ role: "user", content: PROMPT(text) }],
    });
  } catch (error) {
    console.error("organizeRecipeText request failed", error);
    return null;
  }

  if (response.stop_reason === "refusal") return null;

  const parsed = response.parsed_output;
  if (!parsed || !parsed.isRecipe) return null;

  return parsed;
}
