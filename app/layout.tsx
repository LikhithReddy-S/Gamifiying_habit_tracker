// import type React from "react"
// import "@/app/globals.css"
// import { Inter } from "next/font/google"
// import { ThemeProvider } from "@/components/theme-provider"

// const inter = Inter({ subsets: ["latin"] })

// export const metadata = {
//   title: "Habit Hero - Gamified Habit Tracking",
//   description: "Turn your daily habits into a game!",
//     generator: 'v0.dev'
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
//           {children}
//         </ThemeProvider>
//       </body>
//     </html>
//   )
// }



// import './globals.css'

import type { ReactNode } from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import TodoList from "./components/todolist"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Habit Hero - Gamified Habit Tracking",
  description: "Turn your daily habits into a game!",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          
          {children}
          <TodoList />
        </ThemeProvider>
      </body>
    </html>
  )
}