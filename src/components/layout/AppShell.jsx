import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell({ children, pageTitle }) {
  return (
    <div className="min-h-screen bg-[#0c0f0f] flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <TopBar pageTitle={pageTitle} />

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
