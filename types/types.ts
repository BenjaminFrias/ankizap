import { MAX_CARD_COUNT, MIN_CARD_COUNT } from '@/constants';
import { z } from 'zod';

export enum SourceType {
	prompt = 'prompt',
	file = 'file',
	link = 'link',
}

const CardTypeEnum = ['basic', 'reversed'] as const;
export type CardType = (typeof CardTypeEnum)[number];

export const FlashcardSchema = z.object({
	id: z.string().optional(),
	front: z.string().min(1, 'The front is required'),
	back: z.string().min(1, 'The back is required'),
	type: z.enum(CardTypeEnum),
});

export const FlashcardArraySchema = z.array(FlashcardSchema);
export type Flashcard = z.infer<typeof FlashcardSchema>;

// ACTIONS
export type ActionState<T> =
	| { ok: true; data: T }
	| { ok: false; error: string };

// GENERATION TYPES
export const GenerationResponseSchema = z.object({
	deckName: z.string().min(1, 'Deck name is required.'),
	cards: z.array(FlashcardSchema),
});

export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;

export const GenerationRequestSchema = z.object({
	inputContent: z.string().min(10, 'Content must be at least 10 characters.'),
	cardCount: z.coerce
		.number()
		.min(
			MIN_CARD_COUNT,
			`Please select at least ${MIN_CARD_COUNT} card to generate.`,
		)
		.max(MAX_CARD_COUNT, `Limit is ${MAX_CARD_COUNT} cards per generation`),
	cardType: z.enum(CardTypeEnum),
	sourceType: z.enum(SourceType),
	file: z.instanceof(File).optional(),
});

export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

// REFINE TYPES
export const RefineRequestSchema = z.object({
	flashcard: FlashcardSchema,
	refineInstruction: z.string().min(5, 'Please write a valid refine prompt.'),
});
export type RefineRequest = z.infer<typeof RefineRequestSchema>;

export const RefineResponseSchema = FlashcardSchema.clone();
export type RefineResponse = z.infer<typeof RefineResponseSchema>;
