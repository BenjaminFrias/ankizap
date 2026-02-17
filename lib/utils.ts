import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type ScrapeType = {
	isYoutubeLink: boolean;
	content: string;
	link: string;
};

export function scrapeContentFromPrompt(prompt: string): ScrapeType | null {
	const youtubeLinkRegex =
		/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s]*)$/;

	const url = extractLink(prompt);
	if (!url) {
		return null;
	}

	const isYoutubeLink = youtubeLinkRegex.test(url);
	if (isYoutubeLink) {
		const promptWithoutLink = prompt.replace(url, '').trim();

		return {
			isYoutubeLink: true,
			content: promptWithoutLink,
			link: url,
		};
	}

	return {
		isYoutubeLink: false,
		content: prompt,
		link: url,
	};
}

export function extractLink(text: string): string | null {
	const urlRegex =
		/((https?:\/\/|www\.)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?)/gi;

	const match = text.match(urlRegex);

	return match === null ? null : match[0];
}
