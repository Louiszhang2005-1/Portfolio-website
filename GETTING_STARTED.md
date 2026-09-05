# Portfolio — Getting Started

## Prerequisites

- **Node.js** v18 or later — [download](https://nodejs.org/)
- **npm** (comes with Node.js)

## Quick Start

All commands must be run from the **`portfolio/`** directory, not the repo root.

```bash
# 1. Navigate into the project folder
cd portfolio

# 2. Install dependencies (first time only, or after pulling new changes)
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**.

## Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the Next.js dev server (hot reload)|
| `npm run build`   | Create an optimized production build     |
| `npm run start`   | Serve the production build locally       |
| `npm run lint`    | Run ESLint on the codebase               |

## Common Issues

### `npm error Missing script: "dev"`

You're running commands from the **repo root** instead of the `portfolio/` folder.  
Fix: `cd portfolio` first, then retry.

### Port 3000 already in use

Another process is using port 3000. Either stop it or run on a different port:

```bash
npm run dev -- -p 3001
```

## Project Structure

```
Portfolio---Ship/
└── portfolio/        ← Run all commands from here
    ├── src/
    │   ├── app/           ← Next.js App Router (pages, layout)
    │   └── components/    ← React components (Island, BlueprintModal, etc.)
    ├── public/            ← Static assets
    ├── package.json       ← Scripts & dependencies
    └── next.config.ts     ← Next.js configuration
```
