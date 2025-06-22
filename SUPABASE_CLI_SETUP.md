# Supabase CLI Installation Guide

## Prerequisites
- Node.js 16+ installed on your system
- A Supabase account and project

## Installation Methods

### Option 1: Using npx (Recommended - No Global Install)
You can run Supabase CLI commands directly without installing globally:
```bash
npx supabase --version
```

### Option 2: Using Homebrew (macOS/Linux)
```bash
brew install supabase/tap/supabase
```

### Option 3: Using Scoop (Windows)
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Option 4: Direct Download
Download the binary for your platform from:
https://github.com/supabase/cli/releases

### Option 5: Local Project Installation
Install as a dev dependency in your project:
```bash
npm install --save-dev supabase
```
Then use it via npm scripts or npx:
```bash
npx supabase --version
```

## Verify Installation
After installation, verify it works:
```bash
# If installed via Homebrew/Scoop/Direct download
supabase --version

# If using npx
npx supabase --version

# If installed locally in project
npx supabase --version
```

## Next Steps

### 1. Login to Supabase
```bash
# Using global installation
supabase login

# Using npx
npx supabase login
```
This will open your browser to authenticate with your Supabase account.

### 2. Link Your Project
Navigate to your project directory and link it to your Supabase project:
```bash
# Using global installation
supabase link --project-ref YOUR_PROJECT_ID

# Using npx
npx supabase link --project-ref YOUR_PROJECT_ID
```

You can find your PROJECT_ID in your Supabase dashboard under:
Settings → General → Reference ID

### 3. Set Environment Variables for Edge Functions
Your Edge Functions need the OpenAI API key. Set it in your Supabase project:

```bash
# Using global installation
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here

# Using npx
npx supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Deploy Your Edge Functions
Deploy each function individually:

```bash
# Deploy the expertise parsing function
npx supabase functions deploy parse-expertise

# Deploy the help topics parsing function
npx supabase functions deploy parse-help-topics

# Deploy the role parsing function
npx supabase functions deploy parse-role

# Deploy the industry parsing function
npx supabase functions deploy parse-industry

# Deploy the question analysis function
npx supabase functions deploy analyze-question
```

### 5. Test Your Functions
After deployment, you can test them:

```bash
# Test the parse-expertise function
npx supabase functions invoke parse-expertise --data '{"text":"I am a senior product manager with 5 years of experience in SaaS"}'

# Test the parse-help-topics function
npx supabase functions invoke parse-help-topics --data '{"text":"I need help with fundraising and scaling my engineering team"}'

# Test the parse-role function
npx supabase functions invoke parse-role --data '{"text":"I am a senior product manager at a fintech startup"}'

# Test the parse-industry function
npx supabase functions invoke parse-industry --data '{"text":"We are a B2B SaaS company in the fintech space"}'

# Test the analyze-question function
npx supabase functions invoke analyze-question --data '{"title":"How to scale engineering team?","content":"We are growing fast and need to hire more engineers"}'
```

## Recommended Workflow

Since global installation is not supported, I recommend using **npx** for all Supabase CLI commands. This ensures you're always using the latest version without managing global packages.

### Add npm Scripts (Optional)
You can add these to your `package.json` for convenience:

```json
{
  "scripts": {
    "supabase": "supabase",
    "supabase:login": "supabase login",
    "supabase:link": "supabase link",
    "supabase:deploy": "supabase functions deploy",
    "supabase:deploy-all": "supabase functions deploy parse-expertise && supabase functions deploy parse-help-topics && supabase functions deploy parse-role && supabase functions deploy parse-industry && supabase functions deploy analyze-question",
    "supabase:secrets": "supabase secrets list"
  }
}
```

Then use them like:
```bash
npm run supabase:login
npm run supabase:deploy parse-expertise
npm run supabase:deploy-all
```

## Troubleshooting

### Common Issues:

1. **"Installing Supabase CLI as a global module is not supported"**: Use `npx supabase` instead of installing globally with `npm install -g`

2. **Permission denied errors**: Try running with `sudo` (Linux/macOS) or as Administrator (Windows) for Homebrew/Scoop installations

3. **Command not found**: 
   - If using npx: Make sure Node.js is installed
   - If using Homebrew/Scoop: Make sure the CLI is in your PATH

4. **Login issues**: Make sure you have a stable internet connection and try clearing browser cache

5. **Project linking fails**: Double-check your project ID in the Supabase dashboard

6. **Function deployment fails**: Ensure your OpenAI API key is set as a secret and your functions are in the correct directory structure

## Directory Structure
Your Supabase functions should be organized like this:
```
supabase/
├── functions/
│   ├── parse-expertise/
│   │   └── index.ts
│   ├── parse-help-topics/
│   │   └── index.ts
│   ├── parse-role/
│   │   └── index.ts
│   ├── parse-industry/
│   │   └── index.ts
│   └── analyze-question/
│       └── index.ts
```

## Environment Variables
Make sure these are set in your Supabase project:
- `OPENAI_API_KEY`: Your OpenAI API key for the Edge Functions

You can view your current secrets with:
```bash
npx supabase secrets list
```

## Quick Start Commands

Here's the complete sequence to get started:

```bash
# 1. Login to Supabase
npx supabase login

# 2. Link your project (replace with your actual project ID)
npx supabase link --project-ref YOUR_PROJECT_ID

# 3. Set your OpenAI API key
npx supabase secrets set OPENAI_API_KEY=your_openai_api_key_here

# 4. Deploy all functions
npx supabase functions deploy parse-expertise
npx supabase functions deploy parse-help-topics
npx supabase functions deploy parse-role
npx supabase functions deploy parse-industry
npx supabase functions deploy analyze-question

# 5. Test a function
npx supabase functions invoke parse-expertise --data '{"text":"I am a senior product manager"}'
```

## Additional Resources
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Supabase CLI GitHub Repository](https://github.com/supabase/cli)