import type { Metadata } from 'next'
import { Unbounded, Roboto_Condensed, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const unbounded = Unbounded({
  subsets: ['latin'],
  variable: '--nf-unbounded',
  weight: ['400', '500', '600', '700', '900'],
})

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  variable: '--nf-roboto-condensed',
  weight: ['400', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--nf-inter',
})

export const metadata: Metadata = {
  title: 'Margaret Luwena',
  description: 'UI/UX Designer & Creative Director based in Los Angeles.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${robotoCondensed.variable} ${inter.variable} antialiased`}
    >
      <body className="bg-black text-white antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
