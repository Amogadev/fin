'use server';

/**
 * @fileOverview An AI agent to verify facial match between a selfie and images stored in Firestore.
 *
 * - verifyFaceMatch - A function that handles the facial match verification process.
 * - VerifyFaceMatchInput - The input type for the verifyFaceMatch function.
 * - VerifyFaceMatchOutput - The return type for the verifyFaceMatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyFaceMatchInputSchema = z.object({
  selfieDataUri: z
    .string()
    .describe(
      "A selfie of the loan applicant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  storedImageDataUri: z
    .string()
    .describe(
      "The stored image of the loan applicant from Firestore, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VerifyFaceMatchInput = z.infer<typeof VerifyFaceMatchInputSchema>;

const VerifyFaceMatchOutputSchema = z.object({
  isMatch: z.boolean().describe('Whether the selfie matches the stored image.'),
  confidence: z.number().describe('The confidence level of the match (0-1).'),
});
export type VerifyFaceMatchOutput = z.infer<typeof VerifyFaceMatchOutputSchema>;

export async function verifyFaceMatch(input: VerifyFaceMatchInput): Promise<VerifyFaceMatchOutput> {
  return verifyFaceMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyFaceMatchPrompt',
  input: {schema: VerifyFaceMatchInputSchema},
  output: {schema: VerifyFaceMatchOutputSchema},
  prompt: `You are an AI-powered facial recognition system.

You will receive a selfie of a loan applicant and a stored image of the same person from Firestore.

Your task is to determine if the two images match and provide a confidence level for the match.

Selfie: {{media url=selfieDataUri}}
Stored Image: {{media url=storedImageDataUri}}

Output the results in JSON format with the following fields:
- isMatch: true if the faces match, false otherwise.
- confidence: A numerical value between 0 and 1 indicating the confidence level of the match.
`,
});

const verifyFaceMatchFlow = ai.defineFlow(
  {
    name: 'verifyFaceMatchFlow',
    inputSchema: VerifyFaceMatchInputSchema,
    outputSchema: VerifyFaceMatchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
