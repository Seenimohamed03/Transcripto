'use server';

/**
 * @fileOverview Redacts personally identifiable information (PII) from text.
 *
 * - redactPii - A function that redacts PII from text.
 * - RedactPiiInput - The input type for the redactPii function.
 * - RedactPiiOutput - The return type for the redactPii function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RedactPiiInputSchema = z.object({
  text: z.string().describe('The text to redact PII from.'),
});
export type RedactPiiInput = z.infer<typeof RedactPiiInputSchema>;

const RedactPiiOutputSchema = z.object({
  redactedText: z.string().describe('The text with PII redacted.'),
});
export type RedactPiiOutput = z.infer<typeof RedactPiiOutputSchema>;

export async function redactPii(input: RedactPiiInput): Promise<RedactPiiOutput> {
  return redactPiiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'redactPiiPrompt',
  input: {schema: RedactPiiInputSchema},
  output: {schema: RedactPiiOutputSchema},
  prompt: `You are an AI assistant that redacts personally identifiable information (PII) from text.

  Redact any information that could be used to identify an individual, including but not limited to:
  - Names
  - Addresses
  - Phone numbers
  - Email addresses
  - Social security numbers
  - Credit card numbers
  - Dates of birth

  Replace the redacted information with [REDACTED].

  Text: {{{text}}}`,
});

const redactPiiFlow = ai.defineFlow(
  {
    name: 'redactPiiFlow',
    inputSchema: RedactPiiInputSchema,
    outputSchema: RedactPiiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
