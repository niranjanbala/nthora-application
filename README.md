# N-th`ora - Expert Network Platform

A platform that uses AI to unlock expertise hidden deep in your network — without the noise.

## Features

- **AI-Powered Expert Matching**: Find the right experts from your extended network
- **Verified Connections**: Trust-based relationship mapping
- **Early Access System**: Referral-based user onboarding
- **Gamified Experience**: Badge system and XP rewards for contributions

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Fill in your Supabase and OpenAI credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/          # React components
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript types
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
└── data/               # Static data and configurations

supabase/               # Supabase configuration
├── functions/          # Edge Functions
└── migrations/         # Database migrations
```

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=https://nthora.com
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Deployment

### Frontend (Netlify)
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Supabase Edge Functions
Follow the instructions in `SUPABASE_CLI_SETUP.md` to deploy the AI parsing functions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private - All rights reserved