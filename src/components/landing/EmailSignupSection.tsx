import { ReactNode } from 'react'
import { DesignConfig } from '@/types/database'

interface EmailSignupSectionProps {
  children: ReactNode
  designConfig: DesignConfig
}

export default function EmailSignupSection({ children, designConfig }: EmailSignupSectionProps) {
  return (
    <section
      id="signup-section"
      className="py-16 px-4 sm:px-6 lg:px-8"
      style={{
        background: `linear-gradient(135deg, ${designConfig.primaryColor}10, ${designConfig.secondaryColor || designConfig.primaryColor}10)`
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {children}
        </div>
      </div>
    </section>
  )
}
