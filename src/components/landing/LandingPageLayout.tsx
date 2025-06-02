import { ReactNode } from 'react'
import { Project, DesignConfig } from '@/types/database'

interface LandingPageLayoutProps {
  children: ReactNode
  designConfig: DesignConfig
  project: Project
}

export default function LandingPageLayout({
  children,
  designConfig,
  project
}: LandingPageLayoutProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: designConfig.backgroundColor,
        fontFamily: designConfig.fontFamily,
        color: designConfig.textColor
      }}
    >
      {/* Custom CSS injection */}
      {designConfig.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: designConfig.customCSS }} />
      )}

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 {project.title}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
