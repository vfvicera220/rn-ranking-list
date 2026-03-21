# Project Context

This is a React Native library project. All code must be clean, maintainable, and follow modern TypeScript and React Native best practices.

# Coding Guidelines

- Use **TypeScript** for all source files.
- Use **named exports** only (no default exports).
- Organize code in `src/` and tests in `src/__tests__/`.
- Use **functional components** and **React hooks**.
- Type all props, state, and function signatures.
- Follow the project's ESLint and Prettier rules.
- Use camelCase for variables, PascalCase for components.
- Avoid deprecated APIs and patterns.
- Extract reusable logic into hooks or utility functions.

# Project Structure

- Place components in `src/`.
- Place tests in `src/__tests__/`.
- Keep files small and focused.

# Testing

- Use **Jest** and **React Native Testing Library**.
- Each component must have a corresponding test file.
- Mock native modules as needed.

# Security & Performance

- Never hardcode secrets or credentials.
- Validate and sanitize all user input.
- Use memoization and avoid unnecessary re-renders.

# Example

// src/ExampleComponent.tsx
import React from 'react';
import { View, Text } from 'react-native';

export type ExampleComponentProps = { title: string };

export function ExampleComponent({ title }: ExampleComponentProps) {
return (
<View>
<Text>{title}</Text>
</View>
);
}

# Anti-patterns

- No default exports.
- No usage of `any` type unless absolutely necessary.
- No commented-out code in main branches.
- No logic in component bodies that could be extracted to hooks.
