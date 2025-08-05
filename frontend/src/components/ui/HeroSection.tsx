import React from 'react';
import { ArrowRight, Zap, Leaf, Users, Building2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Willkommen in Hechingen",
  subtitle = "Ihre Smart City der Zukunft",
  description = "Erleben Sie Transparenz und Nachhaltigkeit in kommunaler Energieverwaltung - direkt aus dem Herzen der Zollernstadt"
}) => {
  const navigate = useNavigate();
  const achievements = [
    { icon: Zap, value: "45%", label: "Energieeinsparung", color: "text-hechingen-success-600" },
    { icon: Leaf, value: "68%", label: "Erneuerbare Energien", color: "text-hechingen-success-600" },
    { icon: Building2, value: "15", label: "Vernetzte Gebäude", color: "text-hechingen-primary-600" },
    { icon: TrendingUp, value: "€187k", label: "Jährliche Einsparungen", color: "text-hechingen-heritage-600" }
  ];

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-hechingen-primary-50 via-white to-hechingen-accent-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.4'%3E%3Ccircle cx='5' cy='5' r='5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-hechingen-primary-100 rounded-full opacity-60 animate-bounce-subtle"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-hechingen-success-100 rounded-full opacity-60 animate-bounce-subtle" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-hechingen-heritage-100 rounded-full opacity-60 animate-bounce-subtle" style={{animationDelay: '2s'}}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* City Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-soft border border-hechingen-primary-200 mb-6 animate-fade-in">
            <Building2 className="w-4 h-4 text-hechingen-primary-600 mr-2" />
            <span className="text-sm font-medium text-hechingen-primary-700">Zollernstadt Hechingen</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-hechingen-primary-800 mb-6 animate-slide-up leading-tight">
            {title}
            <span className="block text-hechingen-accent-600 text-3xl md:text-4xl lg:text-5xl mt-2 font-medium">
              {subtitle}
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-hechingen-accent-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
            {description}
          </p>

          {/* Achievement Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-slide-up" style={{animationDelay: '0.4s'}}>
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-hechingen-primary-100 hover:shadow-hechingen transition-all duration-300 hover:scale-105">
                <achievement.icon className={`w-8 h-8 ${achievement.color} mx-auto mb-3`} />
                <div className="text-2xl md:text-3xl font-bold text-hechingen-primary-800 mb-1">
                  {achievement.value}
                </div>
                <div className="text-sm text-hechingen-accent-600 font-medium">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{animationDelay: '0.6s'}}>
            <button 
              onClick={() => navigate('/energy-flow')}
              className="inline-flex items-center px-8 py-4 bg-hechingen-primary-500 text-white rounded-xl font-semibold text-lg hover:bg-hechingen-primary-600 transition-all duration-200 shadow-hechingen hover:shadow-lg hover:scale-105 group">
              <span>Zum Energieportal</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a 
              href="https://www.hechingen.de"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-white/90 backdrop-blur-sm text-hechingen-primary-700 rounded-xl font-semibold text-lg hover:bg-white transition-all duration-200 shadow-soft hover:shadow-md border border-hechingen-primary-200 hover:border-hechingen-primary-300"
            >
              <Users className="w-5 h-5 mr-2" />
              <span>Mehr erfahren</span>
            </a>
          </div>

          {/* Sustainability Badge */}
          <div className="mt-12 flex justify-center animate-fade-in" style={{animationDelay: '0.8s'}}>
            <div className="flex items-center space-x-2 bg-hechingen-success-50 px-4 py-2 rounded-full border border-hechingen-success-200">
              <Leaf className="w-4 h-4 text-hechingen-success-600" />
              <span className="text-sm font-medium text-hechingen-success-700">
                Klimaneutral bis 2035 | Nachhaltigkeit mit Tradition
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 text-white fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" opacity="0.8"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;