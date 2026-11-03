import { z } from 'zod'

const livekitEnvSchema = z.object({
  LIVEKIT_API_KEY: z
    .string({ required_error: 'LIVEKIT_API_KEY is required' })
    .min(1, 'LIVEKIT_API_KEY cannot be empty'),
  LIVEKIT_API_SECRET: z
    .string({ required_error: 'LIVEKIT_API_SECRET is required' })
    .min(1, 'LIVEKIT_API_SECRET cannot be empty'),
  NEXT_PUBLIC_LIVEKIT_URL: z
    .string({ required_error: 'NEXT_PUBLIC_LIVEKIT_URL is required' })
    .min(1, 'NEXT_PUBLIC_LIVEKIT_URL cannot be empty')
    .refine(
      (val) =>
        val.startsWith('wss://') ||
        val.startsWith('ws://') ||
        val.startsWith('https://') ||
        val.startsWith('http://'),
      {
        message:
          'NEXT_PUBLIC_LIVEKIT_URL must start with a valid protocol (wss://, ws://, https://, or http://)',
      }
    ),
})

export type LiveKitEnv = z.infer<typeof livekitEnvSchema>

/**
 * Validates and retrieves server-side LiveKit environment variables.
 * Throws a descriptive error if any of the required keys are missing or invalid.
 */
export function getLiveKitEnv(): LiveKitEnv {
  const result = livekitEnvSchema.safeParse({
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
    NEXT_PUBLIC_LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL,
  })

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    throw new Error(
      `[LiveKit Config] Missing or invalid environment variables: ${issues}`
    )
  }

  return result.data
}

/**
 * Runtime assertion confirming LiveKit environment variables are configured
 * before executing server-side token minting.
 *
 * @returns The validated LiveKit configuration object.
 * @throws Error if any required LiveKit environment variable is missing or malformed.
 */
export function assertLiveKitConfig(): LiveKitEnv {
  return getLiveKitEnv()
}
