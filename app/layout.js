import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Planeador Financeiro 2026 - Portugal',
  description: 'Ferramenta gratuita para planeamento financeiro familiar em Portugal',
  keywords: 'finanças pessoais, Portugal, planeamento financeiro, orçamento familiar, subsídio férias, subsídio natal',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
