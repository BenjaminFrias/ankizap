'use client';

import { generateAction } from '@/actions';
import FlashcardResults from '@/components/generate/FlashcardResults';
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
import { SourceType } from '@/types/types';
import { useActionState, useState } from 'react';

export default function Generate() {
	const [generateState, dispatchGenerate, isGenerating] = useActionState(
		generateAction,
		null,
	);

	const [isFileInput, setIsFileInput] = useState(false);
	const [sourceType, setSourceType] = useState(SourceType.prompt);

	const onSourceChange = (sourceType: SourceType) => {
		setIsFileInput(sourceType === SourceType.file);
		setSourceType(sourceType);
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

			{generateState && <FlashcardResults generateState={generateState} />}
		</div>
	);
}
