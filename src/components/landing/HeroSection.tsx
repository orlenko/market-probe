import { Project, TemplateConfig, DesignConfig } from '@/types/database';

interface HeroSectionProps {
  templateConfig: TemplateConfig;
  designConfig: DesignConfig;
  project: Project;
}

export default function HeroSection({ templateConfig, designConfig, project }: HeroSectionProps) {
  const heroStyle = designConfig.hero?.style || 'centered';

  return (
    <section
      className={`py-20 px-4 sm:px-6 lg:px-8 ${
        heroStyle === 'fullscreen' ? 'min-h-screen flex items-center' : ''
      }`}
      style={{
        backgroundImage: designConfig.hero?.backgroundImage
          ? `url(${designConfig.hero.backgroundImage})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background overlay for better text readability */}
      {designConfig.hero?.backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      )}

      <div
        className={`max-w-4xl mx-auto text-center relative z-10 ${
          heroStyle === 'split' ? 'lg:text-left lg:flex lg:items-center lg:space-x-12' : ''
        }`}
      >
        {/* Logo */}
        {designConfig.logo && (
          <div className="mb-8">
            <img
              src={designConfig.logo.url}
              alt={designConfig.logo.alt || `${project.title} logo`}
              className="mx-auto"
              style={{
                width: designConfig.logo.width || 'auto',
                height: designConfig.logo.height || 60,
                maxWidth: '200px',
              }}
            />
          </div>
        )}

        <div className={heroStyle === 'split' ? 'lg:flex-1' : ''}>
          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            style={{
              color: designConfig.hero?.backgroundImage ? '#ffffff' : designConfig.textColor,
            }}
          >
            {templateConfig.headline}
          </h1>

          {/* Subheadline */}
          <p
            className="text-xl sm:text-2xl mb-8 leading-relaxed"
            style={{
              color: designConfig.hero?.backgroundImage
                ? 'rgba(255, 255, 255, 0.9)'
                : 'rgba(107, 114, 128, 1)',
            }}
          >
            {templateConfig.subheadline}
          </p>

          {/* CTA Button */}
          <div className="flex justify-center lg:justify-start">
            <button
              onClick={() => {
                // Scroll to signup section
                document.getElementById('signup-section')?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
              className="px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
              style={{
                backgroundColor: designConfig.primaryColor,
                color: '#ffffff',
                borderColor: designConfig.primaryColor,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor =
                  designConfig.secondaryColor || designConfig.primaryColor;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = designConfig.primaryColor;
              }}
            >
              {templateConfig.ctaText}
            </button>
          </div>
        </div>

        {/* Hero Image/Video (for split layout) */}
        {heroStyle === 'split' && (
          <div className="lg:flex-1 mt-12 lg:mt-0">
            {designConfig.hero?.backgroundVideo ? (
              <video autoPlay muted loop className="w-full rounded-lg shadow-2xl">
                <source src={designConfig.hero.backgroundVideo} type="video/mp4" />
              </video>
            ) : (
              <div className="w-full h-64 lg:h-96 bg-gray-200 rounded-lg shadow-2xl flex items-center justify-center">
                <span className="text-gray-500">Product Preview</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
