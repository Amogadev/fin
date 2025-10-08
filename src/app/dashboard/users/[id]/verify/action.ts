"use server";

import {
  verifyFaceMatch,
  VerifyFaceMatchOutput,
} from "@/ai/flows/facial-match-verification";
import { z } from "zod";

const ActionInputSchema = z.object({
  selfieDataUri: z.string(),
  storedImageDataUri: z.string(),
});

export async function performVerification(input: {
  selfieDataUri: string;
  storedImageDataUri: string;
}): Promise<VerifyFaceMatchOutput | { error: string }> {
  const parsedInput = ActionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return { error: "Invalid input." };
  }

  try {
    const result = await verifyFaceMatch(parsedInput.data);
    return result;
  } catch (e) {
    console.error(e);
    return { error: "An unexpected error occurred during verification." };
  }
}
