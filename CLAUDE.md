# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production (runs TypeScript compilation then Vite build)
- `yarn preview` - Preview production build locally
- `yarn typecheck` - Run TypeScript type checking without emitting files

## Project Architecture

This is a React + TypeScript application built with Vite, focused on creating a Markov Chain solver with a multi-step form interface.

### Key Components Structure

- **App.tsx**: Main application wrapper with Mantine provider and theme setup
- **MarkovChain component**: Main feature located in `src/pages/MarkovChain/`
  - Uses a multi-step stepper interface with 4 steps
  - Implements form validation at each step
  - Components are organized in `_components/` directory (step-1.tsx, step-2.tsx, step-3.tsx, step-final.tsx)

### Form Management

- Uses Mantine's `createFormContext` for form state management
- Form context defined in `_contexts/markov-chain-form-context.tsx`
- Form values include: states, initialStateDistribution, transitionMatrix, sequenceLength
- Step-by-step validation ensures data integrity at each stage

### Technology Stack

- **Frontend**: React 19 + TypeScript
- **UI Library**: Mantine 8.3.1 (includes core, form, hooks)
- **Icons**: Tabler Icons React
- **Build Tool**: Vite 7.1.5
- **Styling**: PostCSS with Mantine preset and simple variables
- **Package Manager**: Yarn 4.9.4

### File Organization

```
src/
├── pages/MarkovChain/           # Main feature directory
│   ├── _components/             # Step components (step-1, step-2, etc.)
│   ├── _contexts/              # Form context management
│   └── markov-chain.tsx        # Main component with stepper logic
├── App.tsx                     # Application root
├── theme.ts                    # Mantine theme configuration
└── main.tsx                    # Application entry point
```

The application follows a page-based architecture with feature-specific directories containing their own components and contexts.