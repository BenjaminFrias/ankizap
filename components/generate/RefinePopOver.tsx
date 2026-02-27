'use client';

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { RefineResponse } from '@/types/types';
import { Input } from '../ui/input';
import { useState } from 'react';

type RefinePopoverProps = {
	card: RefineResponse;
	refineFormAction: (payload: FormData) => void;
};

export default function RefinePopover({
	card,
	refineFormAction,
}: RefinePopoverProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild className="mt-5">
				<Button variant="outline">Refine card</Button>
			</PopoverTrigger>

			<PopoverContent className="w-80">
				<form
					action={refineFormAction}
					onSubmit={() => setIsOpen(false)}
					id={`refine-form-${card.id}`}
				>
					<div className="grid gap-4">
						<div className="space-y-2">
							<p className="text-muted-foreground text-sm">
								Type your refinement prompt
							</p>
						</div>
						<div className="grid gap-2">
							<input
								type="hidden"
								name="flashcard"
								value={JSON.stringify({
									id: card.id,
									front: card.front,
									back: card.back,
									type: card.type,
								})}
							/>
							<Input
								placeholder="Type your refinement prompt"
								name="refineInstruction"
							/>
							<Button
								type="submit"
								size="sm"
								className="w-30 bg-blue-800"
								form={`refine-form-${card.id}`}
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
