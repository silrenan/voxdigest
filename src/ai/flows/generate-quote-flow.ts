
'use server';
/**
 * @fileOverview Generates a short, inspirational, or philosophical quote.
 *
 * - generateInspirationalQuote - A function that generates a quote.
 * - GenerateQuoteInput - The input type for the generateInspirationalQuote function.
 * - GenerateQuoteOutput - The return type for the generateInspirationalQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuoteInputSchema = z.object({
  // Optional: theme: z.string().describe('A theme for the quote.').optional(),
});
export type GenerateQuoteInput = z.infer<typeof GenerateQuoteInputSchema>;

const GenerateQuoteOutputSchema = z.object({
  quote: z.string().describe('The generated quote.'),
});
export type GenerateQuoteOutput = z.infer<typeof GenerateQuoteOutputSchema>;

export async function generateInspirationalQuote(input?: GenerateQuoteInput): Promise<GenerateQuoteOutput> {
  return generateInspirationalQuoteFlow(input || {});
}

const quotePrompt = ai.definePrompt({
  name: 'generateInspirationalQuotePrompt',
  input: {schema: GenerateQuoteInputSchema},
  output: {schema: GenerateQuoteOutputSchema},
  prompt: `Generate a short, poignant, and thought-provoking quote. It could touch on themes of existence, duty, or fleeting moments. Keep it under 25 words. The tone should be reflective, perhaps with a hint of stoicism or melancholy.`,
});

const generateInspirationalQuoteFlow = ai.defineFlow(
  {
    name: 'generateInspirationalQuoteFlow',
    inputSchema: GenerateQuoteInputSchema,
    outputSchema: GenerateQuoteOutputSchema,
  },
  async (input) => {
    const {output} = await quotePrompt(input);
    if (!output?.quote) {
        throw new Error('Quote generation failed to produce text.');
    }
    return { quote: output.quote };
  }
);
