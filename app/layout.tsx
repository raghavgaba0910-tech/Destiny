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
      <body>
        <ResetLegacyLocalData />
        {children}
      </body>
    </html>
  )
}
