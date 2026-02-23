import ankiApkgExport from '@paperclipsapp/anki-apkg-export';

export async function POST(req: Request) {
	const { deckName, cards } = await req.json();

	const apkg = ankiApkgExport(deckName, {});
	cards.forEach((card: { front: string; back: string }) => {
		apkg.addCard(card.front, card.back);
	});

	const deck = await apkg.save();

	return new Response(Buffer.from(deck), {
		headers: {
			'Content-Type': 'application/apkg',
		},
	});
}
