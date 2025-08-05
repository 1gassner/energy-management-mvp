import { toast } from 'react-hot-toast';

interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  precipitation: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
  dewPoint: number;
  timestamp: Date;
}

interface WeatherForecast {
  current: WeatherData;
  hourly: WeatherData[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
}

interface DailyForecast {
  date: Date;
  tempMin: number;
  tempMax: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  cloudCover: number;
  sunrise: Date;
  sunset: Date;
}

interface WeatherAlert {
  type: 'warning' | 'watch' | 'advisory';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  event: string;
  headline: string;
  description: string;
  start: Date;
  end: Date;
}

interface EnergyPrediction {
  heatingDemand: number; // kWh
  coolingDemand: number; // kWh
  solarProduction: number; // kWh
  totalConsumption: number; // kWh
  peakLoadTime: Date;
  recommendations: string[];
  confidence: number; // 0-100%
}

class WeatherService {
  private readonly API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo';
  private readonly BASE_URL = 'https://api.openweathermap.org/data/3.0';
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  
  // Hechingen coordinates
  private readonly HECHINGEN_LAT = 48.3517;
  private readonly HECHINGEN_LON = 8.9635;

  constructor() {
    // Initialize with demo mode if no API key
    if (this.API_KEY === 'demo') {
      console.warn('Weather service running in demo mode');
    }
  }

  /**
   * Get current weather and forecast
   */
  async getWeatherForecast(): Promise<WeatherForecast> {
    const cacheKey = `weather-${this.HECHINGEN_LAT}-${this.HECHINGEN_LON}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // Demo mode data
    if (this.API_KEY === 'demo') {
      return this.getDemoWeatherData();
    }

    try {
      // OpenWeather One Call API 3.0
      const response = await fetch(
        `${this.BASE_URL}/onecall?lat=${this.HECHINGEN_LAT}&lon=${this.HECHINGEN_LON}&units=metric&appid=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      const forecast = this.transformApiResponse(data);
      
      // Cache the result
      this.cache.set(cacheKey, { data: forecast, timestamp: Date.now() });
      
      return forecast;
    } catch (error) {
      console.error('Weather API error:', error);
      toast.error('Wetterdaten konnten nicht geladen werden');
      return this.getDemoWeatherData();
    }
  }

  /**
   * Transform API response to our format
   */
  private transformApiResponse(data: any): WeatherForecast {
    return {
      current: {
        temperature: data.current.temp,
        humidity: data.current.humidity,
        pressure: data.current.pressure,
        windSpeed: data.current.wind_speed,
        windDirection: data.current.wind_deg,
        cloudCover: data.current.clouds,
        precipitation: data.current.rain?.['1h'] || 0,
        visibility: data.current.visibility / 1000, // Convert to km
        uvIndex: data.current.uvi,
        feelsLike: data.current.feels_like,
        dewPoint: data.current.dew_point,
        timestamp: new Date(data.current.dt * 1000)
      },
      hourly: data.hourly.slice(0, 48).map((hour: any) => ({
        temperature: hour.temp,
        humidity: hour.humidity,
        pressure: hour.pressure,
        windSpeed: hour.wind_speed,
        windDirection: hour.wind_deg,
        cloudCover: hour.clouds,
        precipitation: hour.rain?.['1h'] || hour.snow?.['1h'] || 0,
        visibility: hour.visibility / 1000,
        uvIndex: hour.uvi,
        feelsLike: hour.feels_like,
        dewPoint: hour.dew_point,
        timestamp: new Date(hour.dt * 1000)
      })),
      daily: data.daily.slice(0, 7).map((day: any) => ({
        date: new Date(day.dt * 1000),
        tempMin: day.temp.min,
        tempMax: day.temp.max,
        humidity: day.humidity,
        precipitation: (day.rain || 0) + (day.snow || 0),
        windSpeed: day.wind_speed,
        cloudCover: day.clouds,
        sunrise: new Date(day.sunrise * 1000),
        sunset: new Date(day.sunset * 1000)
      })),
      alerts: data.alerts?.map((alert: any) => ({
        type: this.mapAlertType(alert.event),
        severity: this.mapAlertSeverity(alert.event),
        event: alert.event,
        headline: alert.event,
        description: alert.description,
        start: new Date(alert.start * 1000),
        end: new Date(alert.end * 1000)
      })) || []
    };
  }

  /**
   * Predict energy consumption based on weather
   */
  async predictEnergyConsumption(
    buildingType: string,
    buildingArea: number,
    historicalData?: any[]
  ): Promise<EnergyPrediction> {
    const weather = await this.getWeatherForecast();
    
    // Base consumption factors per m² (kWh/m²/day)
    const baseConsumption = {
      rathaus: 0.15,
      realschule: 0.12,
      grundschule: 0.11,
      gymnasium: 0.13,
      werkrealschule: 0.12,
      sporthallen: 0.18,
      hallenbad: 0.25
    }[buildingType] || 0.15;

    // Calculate heating demand based on temperature
    const heatingBaseTemp = 15; // Heating needed below 15°C
    const heatingDegreeHours = weather.hourly.slice(0, 24).reduce((sum, hour) => {
      const deficit = Math.max(0, heatingBaseTemp - hour.temperature);
      return sum + deficit;
    }, 0);
    const heatingDemand = buildingArea * baseConsumption * heatingDegreeHours * 0.1;

    // Calculate cooling demand based on temperature
    const coolingBaseTemp = 24; // Cooling needed above 24°C
    const coolingDegreeHours = weather.hourly.slice(0, 24).reduce((sum, hour) => {
      const excess = Math.max(0, hour.temperature - coolingBaseTemp);
      return sum + excess;
    }, 0);
    const coolingDemand = buildingArea * baseConsumption * coolingDegreeHours * 0.08;

    // Calculate solar production potential
    const solarCapacity = buildingArea * 0.1; // Assume 10% roof coverage with 200W/m² panels
    const avgCloudCover = weather.hourly.slice(0, 24).reduce((sum, h) => sum + h.cloudCover, 0) / 24;
    const solarEfficiency = (100 - avgCloudCover) / 100;
    const daylightHours = (weather.daily[0].sunset.getTime() - weather.daily[0].sunrise.getTime()) / 3600000;
    const solarProduction = solarCapacity * 0.2 * daylightHours * solarEfficiency; // 20% panel efficiency

    // Total consumption
    const baseLoad = buildingArea * baseConsumption * 24;
    const totalConsumption = baseLoad + heatingDemand + coolingDemand;

    // Peak load prediction (typically morning or evening)
    const peakHour = weather.current.temperature < 10 ? 7 : 18; // Morning if cold, evening otherwise
    const peakLoadTime = new Date();
    peakLoadTime.setHours(peakHour, 0, 0, 0);

    // Generate recommendations
    const recommendations = this.generateRecommendations(weather, {
      heatingDemand,
      coolingDemand,
      solarProduction,
      totalConsumption
    });

    // Calculate confidence based on data quality
    const confidence = this.API_KEY === 'demo' ? 60 : 85;

    return {
      heatingDemand: Math.round(heatingDemand),
      coolingDemand: Math.round(coolingDemand),
      solarProduction: Math.round(solarProduction),
      totalConsumption: Math.round(totalConsumption),
      peakLoadTime,
      recommendations,
      confidence
    };
  }

  /**
   * Generate energy recommendations based on weather
   */
  private generateRecommendations(
    weather: WeatherForecast,
    prediction: Omit<EnergyPrediction, 'peakLoadTime' | 'recommendations' | 'confidence'>
  ): string[] {
    const recommendations: string[] = [];

    // Temperature-based recommendations
    if (weather.current.temperature < 5) {
      recommendations.push('🔥 Heizung vorzeitig aktivieren für optimale Raumtemperatur');
    }
    if (weather.current.temperature > 25) {
      recommendations.push('❄️ Kühlung in den frühen Morgenstunden nutzen');
    }

    // Solar recommendations
    if (weather.current.cloudCover < 30) {
      recommendations.push('☀️ Optimale Bedingungen für Solarenergie - nicht-kritische Lasten jetzt aktivieren');
    }

    // Wind recommendations
    if (weather.current.windSpeed > 10) {
      recommendations.push('💨 Erhöhte Windgeschwindigkeit - Fenster und Türen abdichten');
    }

    // Precipitation recommendations
    if (weather.hourly.slice(0, 6).some(h => h.precipitation > 0)) {
      recommendations.push('🌧️ Regen erwartet - Regenwasser-Sammelsysteme vorbereiten');
    }

    // Extreme weather alerts
    weather.alerts.forEach(alert => {
      if (alert.severity === 'severe' || alert.severity === 'extreme') {
        recommendations.push(`⚠️ Wetterwarnung: ${alert.headline} - Notfallsysteme prüfen`);
      }
    });

    // Energy saving opportunities
    if (prediction.solarProduction > prediction.totalConsumption * 0.3) {
      recommendations.push('💡 Hohe Solarproduktion erwartet - Energiespeicher laden');
    }

    if (weather.daily[0].tempMax - weather.daily[0].tempMin > 15) {
      recommendations.push('🌡️ Große Temperaturschwankung - Thermostate anpassen');
    }

    return recommendations;
  }

  /**
   * Get demo weather data for testing
   */
  private getDemoWeatherData(): WeatherForecast {
    const now = new Date();
    const baseTemp = 15 + Math.sin(now.getHours() / 24 * Math.PI * 2) * 8;
    
    return {
      current: {
        temperature: baseTemp,
        humidity: 65,
        pressure: 1013,
        windSpeed: 5.5,
        windDirection: 180,
        cloudCover: 40,
        precipitation: 0,
        visibility: 10,
        uvIndex: 3,
        feelsLike: baseTemp - 2,
        dewPoint: baseTemp - 5,
        timestamp: now
      },
      hourly: Array.from({ length: 48 }, (_, i) => {
        const hourTemp = 15 + Math.sin((now.getHours() + i) / 24 * Math.PI * 2) * 8;
        return {
          temperature: hourTemp,
          humidity: 60 + Math.random() * 20,
          pressure: 1010 + Math.random() * 10,
          windSpeed: 3 + Math.random() * 10,
          windDirection: Math.random() * 360,
          cloudCover: Math.random() * 100,
          precipitation: Math.random() > 0.8 ? Math.random() * 5 : 0,
          visibility: 8 + Math.random() * 7,
          uvIndex: Math.max(0, Math.sin((now.getHours() + i - 6) / 12 * Math.PI) * 8),
          feelsLike: hourTemp - Math.random() * 3,
          dewPoint: hourTemp - 5 - Math.random() * 3,
          timestamp: new Date(now.getTime() + i * 3600000)
        };
      }),
      daily: Array.from({ length: 7 }, (_, i) => {
        const dayDate = new Date(now.getTime() + i * 86400000);
        return {
          date: dayDate,
          tempMin: 10 + Math.random() * 5,
          tempMax: 20 + Math.random() * 8,
          humidity: 60 + Math.random() * 20,
          precipitation: Math.random() > 0.7 ? Math.random() * 10 : 0,
          windSpeed: 3 + Math.random() * 12,
          cloudCover: Math.random() * 100,
          sunrise: new Date(dayDate.setHours(6, 30, 0, 0)),
          sunset: new Date(dayDate.setHours(19, 30, 0, 0))
        };
      }),
      alerts: []
    };
  }

  /**
   * Map alert types from API
   */
  private mapAlertType(event: string): 'warning' | 'watch' | 'advisory' {
    if (event.toLowerCase().includes('warning')) return 'warning';
    if (event.toLowerCase().includes('watch')) return 'watch';
    return 'advisory';
  }

  /**
   * Map alert severity from API
   */
  private mapAlertSeverity(event: string): 'minor' | 'moderate' | 'severe' | 'extreme' {
    if (event.toLowerCase().includes('extreme')) return 'extreme';
    if (event.toLowerCase().includes('severe')) return 'severe';
    if (event.toLowerCase().includes('moderate')) return 'moderate';
    return 'minor';
  }

  /**
   * Get historical weather correlation with energy consumption
   */
  async analyzeWeatherCorrelation(
    buildingId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    correlation: number;
    insights: string[];
    chart: { date: Date; temperature: number; consumption: number }[];
  }> {
    // This would normally fetch historical data from the database
    // For now, we'll generate demo correlation data
    
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
    const chart = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate.getTime() + i * 86400000);
      const temp = 15 + Math.sin(i / 30 * Math.PI * 2) * 10;
      const consumption = 1000 - temp * 20 + Math.random() * 100;
      
      return { date, temperature: temp, consumption };
    });

    // Calculate correlation coefficient
    const temps = chart.map(d => d.temperature);
    const consumptions = chart.map(d => d.consumption);
    const correlation = this.calculateCorrelation(temps, consumptions);

    // Generate insights
    const insights = [
      `Temperatur hat ${Math.abs(correlation * 100).toFixed(0)}% Einfluss auf Energieverbrauch`,
      correlation < -0.5 ? 'Starke negative Korrelation: Niedriger Temperatur = Höherer Verbrauch' : '',
      'Optimale Raumtemperatur liegt bei 20-22°C',
      'Jedes Grad weniger erhöht Heizkosten um ~6%'
    ].filter(Boolean);

    return { correlation, insights, chart };
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }
}

export const weatherService = new WeatherService();
export type { WeatherData, WeatherForecast, EnergyPrediction, WeatherAlert };