# TODO - Ollama API Integration

## Step 1: Create .env file with Ollama configuration
- [x] Create `.env` file with OLLAMA_BASE_URL, OLLAMA_MODEL, and OLLAMA_API_KEY

## Step 2: Update /api/chat/route.js
- [x] Replace hardcoded Ollama URL with environment variable
- [x] Use OLLAMA_MODEL from environment
- [x] Add error handling for missing env vars

## Step 3: Update /api/generate-emails/route.js
- [x] Replace static template generation with Ollama AI
- [x] Create system prompt for email generation
- [x] Generate 30 unique, personalized emails using AI
- [x] Support different tones (professional, casual, friendly)

## Step 4: Update /settings/page.js
- [x] Add Ollama configuration section in settings UI
- [x] Add input fields for base URL, model, and API key
- [x] Save/load Ollama settings (localStorage for now)

## Step 5: Test the implementation
- [ ] Verify chat API works with new config
- [ ] Verify email generation uses AI
- [ ] Verify settings UI shows Ollama options

