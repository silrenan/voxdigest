'use server';

/**
 * @fileOverview Summarizes a transcription of audio into key concepts, quotes, facts, latest context, and a TL;DR summary.
 *
 * - summarizeTranscription - A function that summarizes the transcription.
 * - SummarizeTranscriptionInput - The input type for the summarizeTranscription function.
 * - SummarizeTranscriptionOutput - The return type for the summarizeTranscription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTranscriptionInputSchema = z.object({
  transcription: z
    .string()
    .describe('The audio transcription to be summarized.'),
});
export type SummarizeTranscriptionInput = z.infer<
  typeof SummarizeTranscriptionInputSchema
>;

const SummarizeTranscriptionOutputSchema = z.object({
  keyConcepts: z
    .string()
    .describe('Key concepts from the audio transcription.'),
  quotes: z.string().describe('Important quotes from the audio transcription.'),
  facts: z.string().describe('Key facts extracted from the audio transcription.'),
  latestInformation: z
    .string()
    .describe(
      'An overview of recent developments or current context related to the main subject of the transcription, based on general knowledge.'
    ),
  tldrSummary: z
    .string()
    .describe(
      'A TL;DR summary of the audio transcription, incorporating key insights and relevant recent context.'
    ),
});
export type SummarizeTranscriptionOutput = z.infer<
  typeof SummarizeTranscriptionOutputSchema
>;

export async function summarizeTranscription(
  input: SummarizeTranscriptionInput
): Promise<SummarizeTranscriptionOutput> {
  return summarizeTranscriptionFlow(input);
}

const summarizeTranscriptionPrompt = ai.definePrompt({
  name: 'summarizeTranscriptionPrompt',
  input: {schema: SummarizeTranscriptionInputSchema},
  output: {schema: SummarizeTranscriptionOutputSchema},
  prompt: `Summarize the following audio transcription. Extract key concepts, important quotes, and key facts.

After this, identify the main subject or topics discussed in the transcription. Based on your knowledge up to your last update, provide a brief overview of any recent developments, current discussions, or relevant context pertaining to these main subjects. Present this under a section titled "Latest on this Matter".

Then, provide a student-friendly summary designed to help someone study or review the material. Make it clear, concise, and easy to understand, specially on how important points connect.

Finally, provide a TL;DR summary that incorporates the essence of the transcription and any significant points from the "Latest on this Matter" section.

Transcription: {{{transcription}}}`,
});

const summarizeTranscriptionFlow = ai.defineFlow(
  {
    name: 'summarizeTranscriptionFlow',
    inputSchema: SummarizeTranscriptionInputSchema,
    outputSchema: SummarizeTranscriptionOutputSchema,
  },
  async input => {
    const {output} = await summarizeTranscriptionPrompt(input);
    return output!;
  }
);
