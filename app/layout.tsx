import type { Metadata } from 'next'
import './globals.css'
import { ResetLegacyLocalData } from '@/components/destiny/ResetLegacyLocalData'

export const metadata: Metadata = {
  title: 'Destiny — Mental Health for Young Adults',
  description: 'Your mental health journey starts here. Free assessment, professional therapy, daily check-ins.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ResetLegacyLocalData />
        {children}
      </body>
    </html>
  )
}
