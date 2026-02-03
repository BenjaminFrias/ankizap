type CardType = 'basic' | 'reversed';

export type Flashcard = {
	id: string;
	front: string;
	back: string;
	cardType: CardType;
	tags?: string[];
};
