# Beyblade Tracker

A modern web application for tracking your Beyblade collection and tournament performance. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 🧭 Navigation
- Clean, responsive navigation bar across all pages
- Active page highlighting
- Quick access to Home, Collection, and Tournaments
- Mobile-friendly design

### 🔧 Collection Management
- Track your Beyblade parts inventory
- Manage blades, assist blades, ratchets, and bits
- Add products to automatically populate parts
- View collection statistics and insights

### 🏆 Tournament Tracking
- Record tournament results with name, location, and date
- Build and track decks (3 combo sets)
- Monitor points earned per combo
- Performance leaderboards and analytics
- Win/loss statistics

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Development**: Turbopack for fast builds

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── collection/       # Collection management pages
│   ├── tournaments/      # Tournament tracking pages
│   ├── page.tsx          # Homepage
│   └── layout.tsx        # Root layout
├── components/
│   └── Navigation.tsx    # Shared navigation component
├── lib/
│   └── supabase.ts       # Supabase client configuration
├── services/
│   └── database.ts       # Database operations
└── types/
    └── beyblade.ts       # TypeScript type definitions
```

## Development

The project uses:
- **Next.js 15** with App Router for modern React development
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ESLint** for code quality

## Future Enhancements

- Database integration for data persistence
- User authentication and profiles
- Mobile app versions
- Advanced analytics and reporting
- Community features and sharing

## Beyblade X Parts Reference

### Part Types
- **Blade**: The main attack component
- **Assist Blade**: Secondary blade component  
- **Ratchet**: Height and stability component
- **Bit**: The tip that touches the stadium

### Combo Structure
A complete Beyblade combo consists of: Blade + Assist Blade + Ratchet + Bit

## Contributing

This project is in active development. Feel free to suggest features or report issues.

## License

MIT License - feel free to use this project as a starting point for your own Beyblade tracking app!
