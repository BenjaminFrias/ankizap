'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import InputFile from '../ui/input-file';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import {
	CARD_COUNT_OPTIONS,
	CARD_TYPES,
	SOURCE_TYPES,
	SourceType,
} from '@/types/types';
import { capitalizeFirst } from '@/lib/utils';

type GenerateFormProps = {
	onSubmit: (payload: FormData) => void;
	isGenerating: boolean;
};

export default function GenerateForm({
	onSubmit,
	isGenerating,
}: GenerateFormProps) {
	const [isFileInput, setIsFileInput] = useState(false);
	const [sourceType, setSourceType] = useState<SourceType>('prompt');

	const onSourceChange = (sourceType: SourceType) => {
		setIsFileInput(sourceType === 'file');
		setSourceType(sourceType);
	};

	return (
		<form
			action={onSubmit}
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
				<Select
					name="cardCount"
					required
					defaultValue={String(CARD_COUNT_OPTIONS[0])}
				>
					<SelectTrigger className="w-full text-gray-600" size="sm">
						<SelectValue placeholder="How many?" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Amount of cards</SelectLabel>
							{CARD_COUNT_OPTIONS.map((count) => (
								<SelectItem key={count} value={String(count)}>
									{count}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>

				<Select name="cardType" required defaultValue={CARD_TYPES[0]}>
					<SelectTrigger className="w-full" size="sm">
						<SelectValue placeholder="Card type" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Choose the card type</SelectLabel>
							{CARD_TYPES.map((type) => (
								<SelectItem value={type} key={type}>
									{capitalizeFirst(type)}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>

				<input type="hidden" name="sourceType" value={sourceType} />

				<ToggleGroup
					type="single"
					size="sm"
					defaultValue={SOURCE_TYPES[0]}
					variant="outline"
					spacing={2}
				>
					{SOURCE_TYPES.map((type) => (
						<ToggleGroupItem
							value={type}
							aria-label={`Toggle ${type}`}
							onClick={() => onSourceChange(type)}
							key={type}
						>
							{capitalizeFirst(type)}
						</ToggleGroupItem>
					))}
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
	);
}
