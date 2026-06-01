'use client'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não configurada. Copie .env.example para .env.local e preencha os valores.`)
  }
  return value
}

function getFirebaseConfig() {
  return {
    apiKey: requireEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: requireEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: requireEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
  }
}

export const firebaseConfig = new Proxy({} as ReturnType<typeof getFirebaseConfig>, {
  get(_target, prop) {
    const config = getFirebaseConfig()
    return config[prop as keyof ReturnType<typeof getFirebaseConfig>]
  },
})

export function getFirebaseProjectId(): string {
  return getFirebaseConfig().projectId
}

export function getFirebaseApiKey(): string {
  return getFirebaseConfig().apiKey
}
