'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type DeletePopOverProps = {
	onDelete: () => void;
};

export default function DeletePopOver({ onDelete }: DeletePopOverProps) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild className="mt-5">
				<Button variant={'secondary'} aria-label="delete card">
					Delete
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-80">
				<p>Are you sure?</p>
				<div className="flex gap-5">
					<Button
						onClick={() => {
							onDelete();
							setOpen(false);
						}}
						aria-label="confirm deletion"
					>
						Yes
					</Button>
					<Button onClick={() => setOpen(false)} aria-label="cancel deletion">
						No
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
