import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
	dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
	testEnvironment: 'jest-environment-jsdom',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	moduleNameMapper: {
		'^@/components/(.*)$': '<rootDir>/components/$1',
		'^@/app/(.*)$': '<rootDir>/app/$1',
		'^@/lib/(.*)$': '<rootDir>/lib/$1',
	},
};

export default createJestConfig(customJestConfig);
