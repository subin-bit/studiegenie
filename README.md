# StudyGenie AI

StudyGenie AI is a deployable Next.js app for a Google/Gemini hackathon. Users can sign in, upload PDFs, get an automatic study pack, and continue chatting with their notes through saved recent chat threads.

## Stack

- Next.js 16 App Router
- Supabase Auth + Postgres + Storage + pgvector
- Google Gemini API via `@google/genai`
- Tailwind CSS 4

## Features

- Email/password login with Supabase
- PDF upload to Supabase Storage
- Text extraction and chunking
- Gemini embeddings + pgvector retrieval
- Chat with document using RAG
- Auto summary, key points, and quiz generation
- ELI5 mode
- Saved recent chats
- Malayalam response option in chat and ELI5 mode

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   GEMINI_API_KEY=
   ```

3. Create a Supabase project, then run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor.

4. In Supabase Auth settings, either:
   - disable email confirmation for the fastest demo flow, or
   - keep it enabled and confirm signup emails through `/auth/callback`

5. Start the app:

   ```bash
   npm run dev
   ```

## Deployment

### Vercel

1. Import this project into Vercel.
2. Add the same environment variables from `.env.local`.
3. Deploy.

### Supabase checklist

- Run the SQL schema once.
- Confirm the `documents` storage bucket exists.
- Use the project URL and publishable key in Vercel.

## App flow

1. User signs in.
2. User uploads a PDF.
3. The app extracts text, chunks it, embeds it with Gemini, and stores vectors in Supabase.
4. StudyGenie generates a summary, key points, and quiz.
5. The first assistant recap is saved to chat history.
6. Later questions use vector retrieval from the same document.

## Notes

- This build is optimized for hackathon MVP speed, not giant textbook uploads.
- For very large PDFs, consider background jobs and resumable pipelines.
- Voice mode and mind maps are not implemented in this version.
