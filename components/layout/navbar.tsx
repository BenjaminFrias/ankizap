'use client';

import Link from 'next/link';
import { Button, buttonVariants } from '../ui/button';
import { cn } from '@/lib/utils';

export default function NavBar() {
	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		element?.scrollIntoView({ behavior: 'smooth' });
	};

	return (
		<header className="fixed top-5 w-full self-center md:w-[80%] border-2 rounded-2xl bg-gray-200">
			<nav className="flex justify-between items-center px-4 py-3">
				<div>Ankizap</div>
				<ul className="gap-7 md:flex hidden">
					<li>
						<Button onClick={() => scrollToSection('how-it-works')}>
							How it works
						</Button>
					</li>
					<li>
						<Button onClick={() => scrollToSection('features')}>
							Features
						</Button>
					</li>
				</ul>
				<Link
					href="/generate"
					className={cn(buttonVariants({ variant: 'secondary' }), 'border-2')}
				>
					Generate flashcards
				</Link>
			</nav>
		</header>
	);
}
