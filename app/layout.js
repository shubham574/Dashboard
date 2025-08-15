import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import Layout from '../components/Layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Employee Management Dashboard',
  description: 'Manage employees, meetings, and attendance',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Layout>
            {children}
          </Layout>
        </body>
      </html>
    </ClerkProvider>
  )
}
