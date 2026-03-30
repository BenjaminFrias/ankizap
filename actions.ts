'use server';

import z from 'zod';
import { generateFlashcards, refineFlashcard } from './lib/flashcard-service';
import {
	ActionState,
	CardType,
	GenerationRequest,
	GenerationRequestSchema,
	GenerationResponse,
	isPresetCardCount,
	RefineRequest,
	RefineRequestSchema,
	RefineResponse,
	SourceType,
} from './types/types';

export async function generateAction(
	prevState: ActionState<GenerationResponse> | null,
	formData: FormData,
): Promise<ActionState<GenerationResponse>> {
	const rawData = Object.fromEntries(formData.entries());
	const inputContent = rawData.inputContent as string;
	const cardType = rawData.cardType as CardType;

	if (inputContent.trim() === '') {
		return { ok: false, error: 'Missing input content' };
	}

	if (!cardType) {
		return { ok: false, error: 'cardType is required.' };
	}

	const cardCount = Number(rawData.cardCount as string);
	if (isNaN(cardCount) || !isPresetCardCount(cardCount)) {
		return { ok: false, error: 'Card count must be a valid number' };
	}

	const generateData: GenerationRequest = {
		inputContent: inputContent,
		cardCount: cardCount,
		cardType: cardType,
		sourceType: rawData.sourceType as SourceType,
		file: rawData.file as File,
	};

	const response = await generalAction<GenerationRequest, GenerationResponse>(
		generateData,
		generateFlashcards,
		GenerationRequestSchema,
	);

	if (response.ok) {
		const cards = response.data.cards.map((card) => ({
			...card,
			id: crypto.randomUUID(),
		}));

		return {
			ok: true,
			data: { ...response.data, deckID: crypto.randomUUID(), cards: cards },
		};
	}

	return response;
}

export async function refineAction(
	prevState: ActionState<RefineResponse> | null,
	formData: FormData,
): Promise<ActionState<RefineResponse>> {
	const rawData = Object.fromEntries(formData.entries());

	let flashcard;
	try {
		flashcard = JSON.parse(rawData.flashcard as string);
	} catch (error) {
		console.error('Error while parsing flashcard: ', error);
		return { ok: false, error: 'Invalid flashcard data.' };
	}

	const refineData: RefineRequest = {
		flashcard: flashcard,
		refineInstruction: rawData.refineInstruction as string,
	};

	const response = await generalAction<RefineRequest, RefineResponse>(
		refineData,
		refineFlashcard,
		RefineRequestSchema,
	);

	if (response.ok) {
		return { ok: true, data: { ...response.data, id: flashcard.id } };
	}

	return response;
}

export async function generalAction<T, K>(
	formData: T,
	aiService: (flashcardData: T) => Promise<ActionState<K>>,
	schema: z.ZodType,
): Promise<ActionState<K>> {
	const formValidated = schema.safeParse(formData);

	if (!formValidated.success) {
		const error = formValidated.error.issues[0].message ?? 'Invalid input';
		console.log('Error while validating form data: ', error);

		return {
			ok: false,
			error: error,
		};
	}

	try {
		const cardResponse: ActionState<K> = await aiService(
			formValidated.data as T,
		);

		if (!cardResponse.ok) {
			return { ok: false, error: cardResponse.error };
		}

		return { ok: true, data: cardResponse.data };
	} catch (error) {
		console.error('Server action error: ', error);
		return {
			ok: false,
			error: 'A connection error occurred. Please try again',
		};
	}
}
