import NavBar from '@/components/layout/navbar';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Home() {
	return (
		<main className="flex flex-col w-full min-h-full bg-white overflow-hidden">
			<NavBar />

			<section className="flex flex-col w-full h-screen justify-center items-center">
				<div className="flex flex-col gap-10 justify-center items-center mt-20">
					<h1 className="text-8xl font-serif text-center text-gray-700">
						Flashcards at
						<span className="text-black font-semibold"> lightspeed</span>
					</h1>
					<p className="max-w-[50%] text-center">
						Stop wasting hours on manual entry. Turn your notes, videos and
						files into Anki decks in one click.
					</p>

					<Link
						href="/generate"
						className={cn(buttonVariants({ variant: 'secondary', size: 'xl' }))}
					>
						Try Ankizap for free
					</Link>
				</div>
			</section>

			<section
				id="how-it-works"
				className="flex flex-col gap-10 w-full bg-blue-950 rounded-[50px] py-20 px-10 scroll-mt-30"
			>
				<h2 className="text-6xl text-white font-serif text-center mb-10">
					10x Faster than manual cards
				</h2>

				<p className="text-white font-semibold w-[50%]">
					Traditional flashcard creation is a chore that steals your study time.
					Ankizap does the heavy lifting so you can focus on what actually
					matters.
				</p>

				<div className="flex gap-15 text-white">
					<div className="flex flex-col gap-2">
						<p className="font-semibold">The old way</p>
						<p>45 min</p>
						<p>copying, pasting, and formatting</p>
					</div>
					<div className="flex flex-col gap-2">
						<p className="font-semibold">The Ankizap way</p>
						<p>20 seconds</p>
						<p>uploading, generating, and syncing</p>
					</div>
				</div>
			</section>

			<section id="features" className="flex flex-col py-30 px-10 scroll-mt-25">
				<div>
					<h2 className="text-6xl text-black font-serif text-center mb-10">
						Capture from anywhere
					</h2>
					<p className="text-center font-bold">
						Whether it’s a deep-dive lecture or a quick article, Ankizap
						understands the context.
					</p>
				</div>
				<div className="flex gap-5 mt-10">
					<div className="rounded-2xl bg-blue-400 p-10">
						<h3 className="text-bold text-2xl mb-3 text-blue-900">
							PDFs & Docs
						</h3>
						<p className="text-white">
							Drop your textbooks and watch them transform into active recall
							questions.
						</p>
					</div>
					<div className="rounded-2xl bg-blue-400 p-10">
						<h3 className="text-bold text-2xl mb-3 text-blue-900">
							YouTube & Links
						</h3>
						<p className="text-white">
							Paste a URL. We’ll extract the core concepts from videos and
							articles instantly.
						</p>
					</div>
					<div className="rounded-2xl bg-blue-400 p-10">
						<h3 className="text-bold text-2xl mb-3 text-blue-900">
							Custom Prompts
						</h3>
						<p className="text-white">
							Have a specific topic? Just ask the AI to build a deck from
							scratch.
						</p>
					</div>
				</div>
			</section>

			<section className="flex flex-col px-10 items-center">
				<h2 className="text-6xl text-black font-serif text-center mb-10">
					AI refinements
				</h2>
				<p className="text-center font-bold mb-5">
					Don’t like a card? Just tell the AI.
				</p>
				<p className="max-w-[75ch] text-center mb-8">
					Unlike rigid generators, AnkiZap is a collaborator. Refine to simplify
					complex definitions, add examples, or change the tone of a specific
					card with a simple prompt.
				</p>

				<Link
					href="/generate"
					className={cn(buttonVariants({ variant: 'secondary', size: 'xl' }))}
				>
					Generate flashcards
				</Link>
			</section>

			<section className="flex flex-col px-10 py-30 items-center ">
				<h2 className="text-6xl text-black font-serif text-center mb-10">
					Seamless export
				</h2>
				<p>
					Download your generated decks and import them directly into Anki with
					one click.
				</p>
			</section>

			<footer className="flex relative flex-col justify-center items-center p-10 min-h-screen bg-blue-300">
				<div className="flex flex-col items-center gap-5">
					<h2 className="font-serif text-7xl font-bold mb-10">Start zapping</h2>
					<p className="max-w-[75ch] text-center mb-8">
						Unlock your learning potential with effortless flashcard creation.
					</p>
					<Link
						href="/generate"
						className={cn(buttonVariants({ variant: 'secondary', size: 'xl' }))}
					>
						Try Ankizap
					</Link>
				</div>

				<div className="absolute flex gap-10 bottom-10 text-blue-500">
					<span>AnkiZap</span>
					<p>© 2026 All rights reserved.</p>
				</div>
			</footer>
		</main>
	);
}
