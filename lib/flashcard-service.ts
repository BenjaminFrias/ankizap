import {
	GenerationRequest,
	GenerationResponseSchema,
	ActionState,
	GenerationResponse,
	RefineRequest,
	RefineResponse,
	RefineRequestSchema,
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

export async function refineFlashcard(
	FlashcardData: RefineRequest,
): Promise<ActionState<RefineResponse>> {
	const { flashcard, refineInstruction } = FlashcardData;

	const systemInstruction = `
        Your task is to refine an existing flashcard based on specific user instruction.
		Existing Card Data:
		Front: ${flashcard.front}.
		Back: ${flashcard.back}.

		User Refine Instruction: \"${refineInstruction}\".

		Strict Requirements:
		1. Maintain Format: Return the card in the exact same JSON schema as the input.
		2. Targeted Change: Only modify the fields necessary to fulfill the user's instruction.
		3. Preserve Atomicity: Ensure the card remains a single, focused concept.
		4. No Prose: Return only the valid JSON object.
		5. Generate a 5-digit random digit number for the id property in the JSON schema.

        OUTPUT:
        The response MUST be a valid JSON array of objects strictly following the provided schema. No prose or introductory text.
	`;

	const userInstruction = `Refine instruction: ${refineInstruction}`;

	return await callAI(systemInstruction, userInstruction, RefineRequestSchema);
}
