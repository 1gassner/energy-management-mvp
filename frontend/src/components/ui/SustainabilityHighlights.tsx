import React from 'react';
import { 
  Leaf, 
  Zap, 
  Droplets, 
  Sun, 
  Wind,
  TreePine,
  Recycle,
  TrendingDown,
  Award,
  Target
} from 'lucide-react';

const SustainabilityHighlights: React.FC = () => {
  const highlights = [
    {
      icon: Leaf,
      title: "CO₂-Neutralität 2035",
      description: "Hechingen ist auf dem Weg zur klimaneutralen Stadt",
      value: "74%",
      progress: 74,
      color: "hechingen-success",
      trend: "+8% zum Vorjahr"
    },
    {
      icon: Sun,
      title: "Solarenergie-Ausbau",
      description: "Photovoltaik auf öffentlichen Gebäuden",
      value: "1.2 MW",
      progress: 65,
      color: "hechingen-heritage",
      trend: "Neue Anlagen 2024"
    },
    {
      icon: Zap,
      title: "Energieeffizienz",
      description: "LED-Umrüstung und Smart Building Technologien",
      value: "45%",
      progress: 85,
      color: "hechingen-primary",
      trend: "Einsparung erreicht"
    },
    {
      icon: TreePine,
      title: "Grünflächenmanagement",
      description: "Urbane Wälder und nachhaltige Stadtentwicklung",
      value: "23 ha",
      progress: 60,
      color: "hechingen-success",
      trend: "Neue Projekte"
    }
  ];

  const certifications = [
    {
      title: "European Energy Award",
      description: "Gold-Status für Energiemanagement",
      year: "2023",
      icon: Award
    },
    {
      title: "BUND Klimaschutz",
      description: "Auszeichnung für lokale Klimapolitik",
      year: "2024",
      icon: Target
    },
    {
      title: "Nachhaltiges Hechingen",
      description: "Bürgerbeteiligung und Transparenz",
      year: "2024",
      icon: Recycle
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-hechingen-success-50 via-white to-hechingen-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-hechingen-success-100 rounded-full mb-6">
            <Leaf className="w-5 h-5 text-hechingen-success-600 mr-2" />
            <span className="text-hechingen-success-800 font-semibold">Nachhaltigkeit & Klimaschutz</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-hechingen-primary-800 mb-6">
            Hechingen wird
            <span className="block text-hechingen-success-600">klimaneutral</span>
          </h2>
          
          <p className="text-xl text-hechingen-accent-600 max-w-3xl mx-auto leading-relaxed">
            Mit innovativen Technologien und durchdachten Konzepten gestalten wir die 
            Zukunft unserer Stadt nachhaltig und bürgernah.
          </p>
        </div>

        {/* Sustainability Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {highlights.map((highlight, index) => (
            <div 
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft border border-hechingen-accent-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className={`w-14 h-14 bg-${highlight.color}-100 rounded-2xl flex items-center justify-center mb-6`}>
                <highlight.icon className={`w-7 h-7 text-${highlight.color}-600`} />
              </div>
              
              <h3 className="text-xl font-bold text-hechingen-primary-800 mb-2">
                {highlight.title}
              </h3>
              
              <p className="text-hechingen-accent-600 text-sm mb-4 leading-relaxed">
                {highlight.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-hechingen-primary-800">
                    {highlight.value}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-${highlight.color}-100 text-${highlight.color}-700 font-medium`}>
                    {highlight.trend}
                  </span>
                </div>
                
                <div className="w-full bg-hechingen-accent-200 rounded-full h-2">
                  <div 
                    className={`bg-${highlight.color}-500 h-2 rounded-full transition-all duration-1000 shadow-sm`}
                    style={{ width: `${highlight.progress}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-hechingen-accent-500 text-right">
                  {highlight.progress}% des Ziels erreicht
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Environmental Impact Stats */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft border border-hechingen-success-200 p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-hechingen-primary-800 mb-4">
              Umweltauswirkungen 2024
            </h3>
            <p className="text-hechingen-accent-600">
              Messbare Erfolge unserer Nachhaltigkeitsinitiativen
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-hechingen-success-50 rounded-xl">
              <TrendingDown className="w-10 h-10 text-hechingen-success-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-hechingen-success-600 mb-2">-187t</div>
              <div className="text-hechingen-accent-700 font-medium">CO₂-Einsparung</div>
              <div className="text-sm text-hechingen-accent-500 mt-1">pro Jahr</div>
            </div>
            
            <div className="text-center p-6 bg-hechingen-primary-50 rounded-xl">
              <Droplets className="w-10 h-10 text-hechingen-primary-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-hechingen-primary-600 mb-2">12%</div>
              <div className="text-hechingen-accent-700 font-medium">Wassereinsparung</div>
              <div className="text-sm text-hechingen-accent-500 mt-1">durch Effizienzmaßnahmen</div>
            </div>
            
            <div className="text-center p-6 bg-hechingen-heritage-50 rounded-xl">
              <Wind className="w-10 h-10 text-hechingen-heritage-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-hechingen-heritage-600 mb-2">€187k</div>
              <div className="text-hechingen-accent-700 font-medium">Kosteneinsparung</div>
              <div className="text-sm text-hechingen-accent-500 mt-1">reinvestiert in neue Projekte</div>
            </div>
          </div>
        </div>

        {/* Awards and Certifications */}
        <div className="bg-gradient-to-r from-hechingen-heritage-50 to-hechingen-primary-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-hechingen-primary-800 mb-4">
              Auszeichnungen & Zertifizierungen
            </h3>
            <p className="text-hechingen-accent-600">
              Anerkannte Erfolge im Bereich Klimaschutz und Nachhaltigkeit
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-hechingen-heritage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <cert.icon className="w-6 h-6 text-hechingen-heritage-600" />
                </div>
                
                <h4 className="font-bold text-hechingen-primary-800 mb-2">
                  {cert.title}
                </h4>
                
                <p className="text-sm text-hechingen-accent-600 mb-3">
                  {cert.description}
                </p>
                
                <div className="inline-flex items-center px-3 py-1 bg-hechingen-heritage-100 rounded-full">
                  <span className="text-xs font-bold text-hechingen-heritage-700">
                    {cert.year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-hechingen-accent-600 mb-6">
            Möchten Sie mehr über unsere Nachhaltigkeitsprojekte erfahren?
          </p>
          <div className="space-x-4">
            <a 
              href="https://www.hechingen.de/umwelt-klima"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-hechingen-success-500 text-white rounded-xl font-semibold hover:bg-hechingen-success-600 transition-all duration-200 shadow-soft hover:shadow-lg hover:scale-105"
            >
              <Leaf className="w-5 h-5 mr-2" />
              Klimaschutz-Konzept
            </a>
            <a 
              href="mailto:umwelt@hechingen.de"
              className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm text-hechingen-primary-700 rounded-xl font-semibold hover:bg-white transition-all duration-200 shadow-soft hover:shadow-md border border-hechingen-primary-200"
            >
              Kontakt Umweltamt
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SustainabilityHighlights;