import {
	GenerationRequest,
	GenerationResponseSchema,
	ActionState,
	GenerationResponse,
} from '@/types/types';
import { callAI } from './ai-service';

export async function generateFlashcards(
	FlashcardData: GenerationRequest,
): Promise<ActionState<GenerationResponse>> {
	const { inputContent, cardCount, cardType } = FlashcardData;

	const systemInstruction = `
        Your task is to transform the provided source content into a highly effective Anki flashcard deck.

        ### TASK:
        Analyze the content above and generate exactly ${cardCount} flashcards.
       
        ### Strict Requirements:
        Quantity: Generate exactly ${cardCount} cards.
        Atomicity: Each card must cover only one distinct fact or concept. Avoid "list-style" cards.
        Language: Use the same language as the provided source text.
		For every card generated, the "type" field MUST be exactly "${cardType}".

        ### OUTPUT:
        The response MUST be a valid JSON array of objects strictly following the provided schema. No prose or introductory text.
	`;

	const userInstruction = `SOURCE CONTENT: ${inputContent}`;

	return await callAI(
		systemInstruction,
		userInstruction,
		GenerationResponseSchema,
	);
}
