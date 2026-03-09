import { Flashcard } from '@/types/types';

type DownloadDeckProps = {
	deckName: string;
	flashcards: Flashcard[];
};

export default async function downloadDeck({
	deckName,
	flashcards,
}: DownloadDeckProps) {
	try {
		const response = await fetch('api/download-deck', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ deckName: deckName, cards: flashcards }),
		});

		if (!response.ok) {
			throw new Error('Failed to download deck');
		}

		const blob = await response.blob();

		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${deckName}.apkg`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		window.URL.revokeObjectURL(url);
	} catch (error) {
		console.error('Failed to download deck.', error);
		throw new Error('Failed to download deck.');
	}
}
