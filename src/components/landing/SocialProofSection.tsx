import { DesignConfig } from '@/types/database';

interface Testimonial {
  name: string;
  company?: string;
  text: string;
  avatar?: string;
}

interface SocialProof {
  testimonials?: Testimonial[];
  metrics?: { [key: string]: string };
}

interface SocialProofSectionProps {
  socialProof: SocialProof;
  designConfig: DesignConfig;
}

export default function SocialProofSection({ socialProof, designConfig }: SocialProofSectionProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Metrics */}
        {socialProof.metrics && Object.keys(socialProof.metrics).length > 0 && (
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold mb-8" style={{ color: designConfig.textColor }}>
              Trusted by thousands
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.entries(socialProof.metrics).map(([key, value], index) => (
                <div key={index} className="text-center">
                  <div
                    className="text-3xl font-bold mb-2"
                    style={{ color: designConfig.primaryColor }}
                  >
                    {value}
                  </div>
                  <div className="text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {socialProof.testimonials && socialProof.testimonials.length > 0 && (
          <div>
            <h2
              className="text-2xl font-bold text-center mb-12"
              style={{ color: designConfig.textColor }}
            >
              What our customers say
            </h2>
            <div
              className={`grid gap-8 ${
                socialProof.testimonials.length === 1
                  ? 'grid-cols-1 max-w-2xl mx-auto'
                  : socialProof.testimonials.length === 2
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {socialProof.testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                >
                  {/* Quote */}
                  <div className="mb-4">
                    <svg
                      className="w-8 h-8 text-gray-300 mb-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p className="text-gray-700 italic leading-relaxed">"{testimonial.text}"</p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full mr-3 flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: designConfig.primaryColor }}
                      >
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold" style={{ color: designConfig.textColor }}>
                        {testimonial.name}
                      </div>
                      {testimonial.company && (
                        <div className="text-sm text-gray-500">{testimonial.company}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
