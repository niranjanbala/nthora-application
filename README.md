# N-th`ora - Expert Network Platform

A platform that uses AI to unlock expertise hidden deep in your network — without the noise.

## Features

- **AI-Powered Expert Matching**: Find the right experts from your extended network
- **Verified Connections**: Trust-based relationship mapping
- **Early Access System**: Referral-based user onboarding
- **Journey Documentation**: Public build log with Strapi CMS

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
   # Fill in your Supabase credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Strapi CMS Setup (for Journey Blog)

1. Start Strapi:
   ```bash
   npm run strapi:dev
   ```

2. Create admin account at http://localhost:1337/admin

3. The content types are already configured:
   - **Journey Chapters**: Organize your journey into chapters
   - **Journey Entries**: Daily/regular entries documenting progress

### Content Types Structure

#### Journey Chapter
- Title (string, required)
- Slug (auto-generated from title)
- Description (text, required)
- Start Date (date, required)
- End Date (date, optional)
- Status (enum: draft/published)
- Order (integer for sorting)
- Cover Image (media, optional)

#### Journey Entry
- Date (date, required)
- Title (string, required)
- Content (rich text, required)
- Mood (enum: excited/frustrated/breakthrough/reflective/determined)
- Tags (JSON array)
- Images (media, multiple)
- Metrics (JSON object for tracking numbers)
- Lessons (JSON array of key learnings)
- Chapter (relation to Journey Chapter)

## Project Structure

```
src/
├── components/          # React components
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript types
├── hooks/              # Custom React hooks
└── lib/                # Utility libraries

strapi/                 # Strapi CMS
├── src/api/           # API endpoints
├── config/            # Configuration
└── data.db            # SQLite database
```

## Deployment

### Frontend (Netlify)
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Strapi CMS
- Can be deployed to Railway, Render, or any Node.js hosting
- Configure production database (PostgreSQL recommended)
- Set environment variables for production

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=https://nthora.com
VITE_STRAPI_URL=http://localhost:1337
VITE_STRAPI_TOKEN=your_strapi_api_token
```

### Strapi (.env)
```
HOST=0.0.0.0
PORT=1337
APP_KEYS="your_app_keys"
API_TOKEN_SALT=your_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_token_salt
JWT_SECRET=your_jwt_secret
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=data.db
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private - All rights reserved