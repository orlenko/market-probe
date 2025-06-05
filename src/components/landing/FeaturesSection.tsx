import { DesignConfig } from '@/types/database';

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface FeaturesSectionProps {
  features: Feature[];
  designConfig: DesignConfig;
}

export default function FeaturesSection({ features, designConfig }: FeaturesSectionProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: designConfig.textColor }}>
            Why Choose Us?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the features that make our solution the perfect choice for your needs.
          </p>
        </div>

        <div
          className={`grid gap-8 ${
            features.length === 1
              ? 'grid-cols-1 max-w-md mx-auto'
              : features.length === 2
                ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                : features.length === 3
                  ? 'grid-cols-1 md:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              {/* Feature Icon */}
              {feature.icon ? (
                <div className="mb-4">
                  <span className="text-4xl">{feature.icon}</span>
                </div>
              ) : (
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${designConfig.primaryColor}20` }}
                >
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: designConfig.primaryColor }}
                  />
                </div>
              )}

              {/* Feature Title */}
              <h3 className="text-xl font-semibold mb-3" style={{ color: designConfig.textColor }}>
                {feature.title}
              </h3>

              {/* Feature Description */}
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
