import {
	GenerationRequest,
	GenerationResponseSchema,
	ActionState,
	GenerationResponse,
	RefineRequest,
	RefineResponse,
	RefineRequestSchema,
	SourceType,
	RefineResponseSchema,
} from '@/types/types';
import { callAI, processAndUploadFileAI } from './ai-service';
import { scrapeContentFromPrompt } from './utils';

export async function generateFlashcards(
	flashcardData: GenerationRequest,
): Promise<ActionState<GenerationResponse>> {
	const { inputContent, cardCount, cardType, sourceType, file } = flashcardData;

	const systemInstruction = `
        Your task is to transform the provided source content into a highly effective Anki flashcard deck.

        ### TASK:
        Analyze the content provided by the user and generate exactly ${cardCount} flashcards.
       
        ### Strict Requirements:
        Quantity: Generate exactly ${cardCount} cards.
        Atomicity: Each card must cover only one distinct fact or concept. Avoid "list-style" cards.
        Language: Use the same language as the provided source text.
		For every card generated, the "type" field MUST be exactly "${cardType}".

        ### OUTPUT:
        The response MUST be a valid JSON array of objects strictly following the provided schema. No prose or introductory text.
	`;

	let userInstruction = inputContent;
	let fileInfo: { uri: string; mimeType: string } | undefined = undefined;

	if (sourceType === SourceType.link) {
		const linkContent = scrapeContentFromPrompt(inputContent);

		if (linkContent === null) {
			console.error('Error while scraping link in flashcard-service.ts.');
			return { ok: false, error: 'Link is not supported.' };
		}

		if (linkContent.isYoutubeLink) {
			// Call AI with link type if link is YT link
			userInstruction = linkContent.content;
			fileInfo = {
				uri: linkContent.link,
				mimeType: 'video/*',
			};

			return await callAI(
				systemInstruction,
				userInstruction,
				GenerationResponseSchema,
				sourceType,
				fileInfo,
			);
		} else {
			// Call AI with prompt type with non-YT links, AI can analyze those links.
			userInstruction = inputContent;

			return await callAI(
				systemInstruction,
				userInstruction,
				GenerationResponseSchema,
				SourceType.prompt,
			);
		}
	}

	if (sourceType === SourceType.file) {
		try {
			if (file) {
				fileInfo = await processAndUploadFileAI(file, file.name);
			} else {
				return { ok: false, error: 'File is missing.' };
			}
		} catch (error) {
			console.error('Error while processing file: ', error);
			return { ok: false, error: 'File processing failed.' };
		}
	}

	return await callAI(
		systemInstruction,
		userInstruction,
		GenerationResponseSchema,
		sourceType,
		fileInfo,
	);
}

export async function refineFlashcard(
	flashcardData: RefineRequest,
): Promise<ActionState<RefineResponse>> {
	const { flashcard, refineInstruction } = flashcardData;

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
		5. Generate a 5-digit random unique digit number for the id property in the JSON schema like (93428).

        OUTPUT:
        The response MUST be a valid JSON strictly following the provided schema. No prose or introductory text.
	`;

	const userInstruction = `Refine instruction: ${refineInstruction}`;

	return await callAI(systemInstruction, userInstruction, RefineResponseSchema);
}
