function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getServerEnv() {
  return {
    geminiApiKey: getRequiredEnv("GEMINI_API_KEY"),
    supabasePublishableKey: getRequiredEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
    supabaseUrl: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  };
}
