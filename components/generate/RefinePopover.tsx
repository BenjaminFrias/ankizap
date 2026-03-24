'use client';

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Flashcard, RefineRequestSchema } from '@/types/types';
import { Input } from '../ui/input';
import { startTransition, SubmitEventHandler, useState } from 'react';
import ErrorMessage from '../ui/ErrorMessage';

type RefinePopoverProps = {
	card: Flashcard;
	refineFormAction: (payload: FormData) => void;
};

export default function RefinePopover({
	card,
	refineFormAction,
}: RefinePopoverProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [refineValue, setRefineValue] = useState('');
	const [error, setError] = useState<string | null>(null);

	const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		setError(null);

		const formData = new FormData(e.currentTarget);
		const raw = Object.fromEntries(formData.entries());

		const formPayload = {
			flashcard: {
				...card,
			},
			refineInstruction: raw.refineInstruction,
		};

		const result = RefineRequestSchema.safeParse(formPayload);

		if (!result.success) {
			const message = result.error.issues[0]?.message ?? 'Invalid input';
			setError(message);
			return;
		}

		setError(null);
		setRefineValue('');
		setIsOpen(false);

		startTransition(() => {
			formData.set('flashcard', JSON.stringify({ ...card }));
			refineFormAction(formData);
		});
	};

	return (
		<Popover
			open={isOpen}
			onOpenChange={(value) => {
				setIsOpen(value);
				setError(null);
				setRefineValue('');
			}}
		>
			<PopoverTrigger asChild className="mt-5">
				<Button variant="outline" aria-label="refine card">
					Refine card
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-80">
				<form
					id={`refine-form-${card.id}`}
					onSubmit={handleSubmit}
					aria-label="refine form"
				>
					<div className="grid gap-4">
						<div className="space-y-2">
							<p className="text-muted-foreground text-sm">
								Type your refinement prompt
							</p>
						</div>
						<div className="grid gap-2">
							<Input
								placeholder="Type your refinement prompt"
								value={refineValue}
								name="refineInstruction"
								onChange={(e) => {
									setRefineValue(e.target.value);
									setError(null);
								}}
								aria-invalid={!!error}
								aria-describedby={error ? `refine-error-${card.id}` : undefined}
								aria-label="refine card input"
							/>

							{error && (
								<ErrorMessage message={error} className="text-red-600 " />
							)}

							<Button
								type="submit"
								size="sm"
								className="w-30 bg-blue-800"
								form={`refine-form-${card.id}`}
								aria-label="submit refine form button"
							>
								Refine
							</Button>
						</div>
					</div>
				</form>
			</PopoverContent>
		</Popover>
	);
}
