'use client';

import { generateAction } from '@/actions';
import FlashcardResults from '@/components/generate/FlashcardResults';
import GenerateForm from '@/components/generate/GenerateForm';
import { useActionState } from 'react';

export default function Generate() {
	const [generationResult, dispatchGenerate, isGenerating] = useActionState(
		generateAction,
		null,
	);

	return (
		<div className="w-full min-h-screen flex flex-col gap-15 py-30 justify-center items-center bg-blue-200">
			<section className="flex justify-center">
				<h1 className="text-5xl">Generate your flashcards</h1>
			</section>

			<section className="flex flex-col justify-center items-center w-full">
				<GenerateForm onSubmit={dispatchGenerate} isGenerating={isGenerating} />
			</section>

			{isGenerating ? (
				<h3 className="font-bold text-2xl text-blue-800">Generating...</h3>
			) : (
				generationResult && (
					<FlashcardResults
						key={
							generationResult.ok ? generationResult.data.deckID : 'no-results'
						}
						generationResult={generationResult}
					/>
				)
			)}
		</div>
	);
}
