# Copilot Instructions for Beyblade Collection & Tournament Tracker

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js web application for tracking Beyblade collections and tournament performance. The app helps Beyblade enthusiasts manage their parts collection and analyze tournament statistics.

## Key Features
1. **Collection Management**: Track Beyblade parts including:
   - Blades
   - Assist Blades  
   - Ratchets
   - Bits

2. **Tournament Tracking**: Record tournament performance with:
   - Tournament name/location
   - Date
   - Deck compositions (3 combo sets)
   - Points earned per combo
   - Performance leaderboards

## Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Development**: Turbopack for fast builds

## Development Guidelines
- Follow React/Next.js best practices
- Use TypeScript for type safety
- Implement responsive design with Tailwind CSS
- Keep components modular and reusable
- Use proper data structures for Beyblade parts and tournament data
- Prioritize user experience and intuitive navigation

## Data Structure Considerations
- Beyblade combos consist of: Blade + Assist Blade + Ratchet + Bit
- Tournament decks contain exactly 3 combos
- Track individual part quantities in collection
- Store tournament results with combo performance metrics
