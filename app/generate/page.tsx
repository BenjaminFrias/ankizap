'use client';

import { generateAction } from '@/actions';
import FlashcardItem from '@/components/generate/flashcard-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputFile from '@/components/ui/input-file';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
	ActionState,
	FlashcardWithId,
	GenerationResponse,
	SourceType,
} from '@/types/types';
import { useActionState, useState } from 'react';

export default function Generate() {
	const [flashcards, setFlashcards] = useState<FlashcardWithId[]>([]);

	const [generateState, dispatchGenerate, isGenerating] = useActionState(
		async (
			prevState: ActionState<GenerationResponse> | null,
			formData: FormData,
		) => {
			const result = await generateAction(prevState, formData);

			if (result?.ok && result.data) {
				setFlashcards(result.data);
			}
			return result;
		},
		null,
	);

	const onRefine = (refinedCard: FlashcardWithId) => {
		setFlashcards((prevState) =>
			prevState.map((card) =>
				card.id === refinedCard.id ? refinedCard : card,
			),
		);
	};

	const [isFileInput, setIsFileInput] = useState(false);
	const [sourceType, setSourceType] = useState(SourceType.prompt);

	const onSourceChange = (sourceType: SourceType) => {
		setIsFileInput(sourceType === SourceType.file);
		setSourceType(sourceType);
	};

	const handleExportDeck = async () => {
		try {
			const deckName = 'MyDeck';
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
			console.error('Failed to fetch deck: ', error);
		}
	};

	return (
		<div className="w-full min-h-screen flex flex-col gap-15 py-30 justify-center items-center bg-blue-200">
			<section className="flex justify-center">
				<h1 className="text-5xl">Generate your flashcards</h1>
			</section>

			<section className="flex flex-col justify-center items-center w-full">
				<form
					action={dispatchGenerate}
					className="flex flex-col w-180 bg-white p-5 rounded-2xl gap-5"
					name="generate-form"
					id="generate-form"
				>
					<div>
						<Input
							placeholder="Type your prompt here..."
							name="inputContent"
							defaultValue=""
							className="border-0 shadow-none"
							required
						></Input>
					</div>

					{isFileInput && <InputFile />}

					<div className="flex gap-4">
						<Select name="cardCount" required defaultValue="5">
							<SelectTrigger className="w-full text-gray-600" size="sm">
								<SelectValue placeholder="How many?" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Amount of cards</SelectLabel>
									<SelectItem value="5">5</SelectItem>
									<SelectItem value="10">10</SelectItem>
									<SelectItem value="20">20</SelectItem>
									<SelectItem value="30">30</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>

						<Select name="cardType" required defaultValue="basic">
							<SelectTrigger className="w-full" size="sm">
								<SelectValue placeholder="Card type" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Choose the card type</SelectLabel>
									<SelectItem value="basic">Basic</SelectItem>
									<SelectItem value="reversed">Reversed</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>

						<input type="hidden" name="sourceType" value={sourceType} />
						<ToggleGroup
							type="single"
							size="sm"
							defaultValue="prompt"
							variant="outline"
							spacing={2}
						>
							<ToggleGroupItem
								value={SourceType.prompt}
								aria-label="Toggle prompt"
								onClick={() => onSourceChange(SourceType.prompt)}
							>
								Prompt
							</ToggleGroupItem>
							<ToggleGroupItem
								value={SourceType.link}
								aria-label="Toggle link"
								onClick={() => onSourceChange(SourceType.link)}
							>
								Link
							</ToggleGroupItem>
							<ToggleGroupItem
								value={SourceType.file}
								aria-label="Toggle file"
								onClick={() => onSourceChange(SourceType.file)}
							>
								File
							</ToggleGroupItem>
						</ToggleGroup>

						<Button
							type="submit"
							form="generate-form"
							size="sm"
							className="w-30 bg-blue-800"
							disabled={isGenerating}
						>
							{isGenerating ? 'Generating...' : 'Generate'}
						</Button>
					</div>
				</form>
			</section>

			<section>
				{generateState ? (
					generateState.ok === true ? (
						<div>
							<h3 className="text-xl font-bold mb-5">Generated cards</h3>
							<div className="flex flex-col gap-5 ">
								{flashcards.map((card) => (
									<FlashcardItem
										key={card.id}
										card={card}
										onRefine={onRefine}
									/>
								))}
							</div>
						</div>
					) : (
						<div className="p-4 bg-red-100 text-red-700 rounded-lg">
							{generateState.error}
						</div>
					)
				) : null}

				{flashcards.length > 0 && (
					<>
						{flashcards.map((card) => (
							<FlashcardItem key={card.id} card={card} onRefine={onRefine} />
						))}
					</>
				)}
			</section>

			{flashcards.length > 0 ? (
				<section>
					<Button onClick={handleExportDeck}>Export Anki Deck</Button>
				</section>
			) : null}
		</div>
	);
}
