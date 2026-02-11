'use server';

import z from 'zod';
import { generateFlashcards, refineFlashcard } from './lib/flashcard-service';
import {
	ActionState,
	CardType,
	GenerationRequest,
	GenerationRequestSchema,
	GenerationResponse,
	RefineRequest,
	RefineRequestSchema,
	RefineResponse,
} from './types/types';
import { MAX_CARD_COUNT, MIN_CARD_COUNT } from './constants';

export async function generateAction(
	prevState: ActionState<GenerationResponse>,
	formData: FormData,
): Promise<ActionState<GenerationResponse>> {
	const rawData = Object.fromEntries(formData.entries());

	const cardCount = Number(rawData.cardCount as string);
	if (
		isNaN(cardCount) ||
		cardCount < MIN_CARD_COUNT ||
		cardCount > MAX_CARD_COUNT
	) {
		return { ok: false, error: 'Card count must be a valid number' };
	}

	const generateData: GenerationRequest = {
		inputContent: rawData.inputContent as string,
		cardCount: cardCount,
		cardType: rawData.cardType as CardType,
	};

	const response = generalAction<GenerationRequest, GenerationResponse>(
		generateData,
		generateFlashcards,
		GenerationRequestSchema,
	);

	return response;
}

export async function refineAction(
	prevState: ActionState<RefineResponse>,
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

	const response = generalAction<RefineRequest, RefineResponse>(
		refineData,
		refineFlashcard,
		RefineRequestSchema,
	);

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
