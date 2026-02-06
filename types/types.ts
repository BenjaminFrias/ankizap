import { z } from 'zod';

export enum CardType {
	BASIC = 'basic',
	REVERSED = 'reversed',
}

export const FlashcardSchema = z.object({
	id: z.string().or(z.number()),
	front: z.string().min(1, 'The front is required'),
	back: z.string().min(1, 'The back is required'),
	type: z.enum(CardType),
});

export const FlashcardArraySchema = z.array(FlashcardSchema);
export type Flashcard = z.infer<typeof FlashcardSchema>;

export const GenerationResponseSchema = z.array(FlashcardSchema);
export type GenerationResponse = z.infer<typeof GenerationResponseSchema>;

export type GenerationRequest = {
	inputContent: string;
	cardCount: number;
	cardType: CardType;
};
