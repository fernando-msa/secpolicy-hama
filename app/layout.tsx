import type { Metadata } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://secpolicy-hama.vercel.app'),
  title: {
    default: 'SecPolicy HAMA',
    template: '%s | SecPolicy HAMA',
  },
  description: 'Plataforma para checklist mensal, score de conformidade e relatório PDF de políticas de segurança da informação em instituições de saúde.',
  openGraph: {
    title: 'SecPolicy HAMA',
    description: 'Checklist mensal, score em tempo real e relatório PDF para gestão de segurança da informação em saúde.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://secpolicy-hama.vercel.app',
    siteName: 'SecPolicy HAMA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SecPolicy HAMA',
    description: 'Plataforma de conformidade mensal em segurança da informação para hospitais e clínicas.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
