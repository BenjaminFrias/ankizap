import { z } from 'zod';

export const SOURCE_TYPES = ['prompt', 'file', 'link'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const CARD_TYPES = ['basic', 'reversed'] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const CARD_COUNT_OPTIONS = [5, 10, 20, 30] as const;
export type CardCountOption = (typeof CARD_COUNT_OPTIONS)[number];

export function isPresetCardCount(n: number): n is CardCountOption {
	return (CARD_COUNT_OPTIONS as readonly number[]).includes(n);
}

export const FlashcardSchema = z.object({
	id: z.string().optional(),
	front: z.string().min(1, 'The front is required'),
	back: z.string().min(1, 'The back is required'),
	type: z.enum(CARD_TYPES),
});

export const FlashcardArraySchema = z.array(FlashcardSchema);
export type Flashcard = z.infer<typeof FlashcardSchema>;

// ACTIONS
export type ActionState<T> =
	| { ok: true; data: T }
	| { ok: false; error: string };

// GENERATION TYPES
export const GenerationResponseSchema = z.object({
	deckID: z.string().optional(),
	deckName: z.string().min(1, 'Deck name is required.'),
	cards: z.array(FlashcardSchema),
});

export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;

export const GenerationRequestSchema = z.object({
	inputContent: z.string().min(10, 'Content must be at least 10 characters.'),
	cardCount: z.coerce.number().refine(isPresetCardCount, {
		message: `Choose one of: ${CARD_COUNT_OPTIONS.join(', ')} cards.`,
	}),
	cardType: z.enum(CARD_TYPES),
	sourceType: z.enum(SOURCE_TYPES),
	file: z.instanceof(File).optional(),
});

export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

// REFINE TYPES
export const RefineRequestSchema = z.object({
	flashcard: FlashcardSchema,
	refineInstruction: z.string().min(5, 'Please write a valid prompt.'),
});
export type RefineRequest = z.infer<typeof RefineRequestSchema>;

export const RefineResponseSchema = FlashcardSchema.clone();
export type RefineResponse = z.infer<typeof RefineResponseSchema>;
