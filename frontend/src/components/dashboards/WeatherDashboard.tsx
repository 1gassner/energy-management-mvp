import React, { useEffect, useState, memo } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, Eye, AlertTriangle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { weatherService, type WeatherForecast, type EnergyPrediction } from '@/services/weatherService';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatNumber } from '@/utils/formatters';

interface WeatherDashboardProps {
  buildingId?: string;
  buildingType?: string;
  buildingArea?: number;
}

export const WeatherDashboard: React.FC<WeatherDashboardProps> = memo(({
  buildingId,
  buildingType = 'rathaus',
  buildingArea = 1000
}) => {
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [prediction, setPrediction] = useState<EnergyPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'current' | 'hourly' | 'daily' | 'prediction'>('current');

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      try {
        const [weatherData, energyPrediction] = await Promise.all([
          weatherService.getWeatherForecast(),
          weatherService.predictEnergyConsumption(buildingType, buildingArea)
        ]);
        
        setWeather(weatherData);
        setPrediction(energyPrediction);
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000); // Update every 10 minutes

    return () => clearInterval(interval);
  }, [buildingType, buildingArea]);

  if (loading || !weather || !prediction) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getWeatherIcon = (cloudCover: number, precipitation: number) => {
    if (precipitation > 0) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (cloudCover > 60) return <Cloud className="w-6 h-6 text-gray-500" />;
    return <Sun className="w-6 h-6 text-yellow-500" />;
  };

  const tabs = [
    { id: 'current', label: 'Aktuell' },
    { id: 'hourly', label: '48 Stunden' },
    { id: 'daily', label: '7 Tage' },
    { id: 'prediction', label: 'Energieprognose' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Current Weather */}
      {selectedTab === 'current' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Temperatur</p>
                <p className="text-2xl font-bold">{weather.current.temperature.toFixed(1)}°C</p>
                <p className="text-xs text-gray-500">Gefühlt: {weather.current.feelsLike.toFixed(1)}°C</p>
              </div>
              <Thermometer className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Luftfeuchtigkeit</p>
                <p className="text-2xl font-bold">{weather.current.humidity}%</p>
                <p className="text-xs text-gray-500">Taupunkt: {weather.current.dewPoint.toFixed(1)}°C</p>
              </div>
              <Droplets className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Wind</p>
                <p className="text-2xl font-bold">{weather.current.windSpeed.toFixed(1)} m/s</p>
                <p className="text-xs text-gray-500">Richtung: {weather.current.windDirection}°</p>
              </div>
              <Wind className="w-8 h-8 text-cyan-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bewölkung</p>
                <p className="text-2xl font-bold">{weather.current.cloudCover}%</p>
                <p className="text-xs text-gray-500">Sicht: {weather.current.visibility.toFixed(1)} km</p>
              </div>
              {getWeatherIcon(weather.current.cloudCover, weather.current.precipitation)}
            </div>
          </Card>

          {/* Additional metrics */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Luftdruck</p>
                <p className="text-2xl font-bold">{weather.current.pressure} hPa</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">UV-Index</p>
                <p className="text-2xl font-bold">{weather.current.uvIndex}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Niederschlag</p>
                <p className="text-2xl font-bold">{weather.current.precipitation.toFixed(1)} mm</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sichtweite</p>
                <p className="text-2xl font-bold">{weather.current.visibility.toFixed(1)} km</p>
              </div>
              <Eye className="w-8 h-8 text-gray-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Hourly Forecast */}
      {selectedTab === 'hourly' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">48-Stunden-Vorhersage</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weather.hourly.map(h => ({
              time: new Date(h.timestamp).getHours() + ':00',
              Temperatur: h.temperature,
              Gefühlt: h.feelsLike,
              Niederschlag: h.precipitation
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="temp" label={{ value: 'Temperatur (°C)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="rain" orientation="right" label={{ value: 'Niederschlag (mm)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="temp" type="monotone" dataKey="Temperatur" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line yAxisId="temp" type="monotone" dataKey="Gefühlt" stroke="#f97316" strokeWidth={1} strokeDasharray="5 5" dot={false} />
              <Area yAxisId="rain" type="monotone" dataKey="Niederschlag" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.6} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Daily Forecast */}
      {selectedTab === 'daily' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">7-Tage-Vorhersage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weather.daily.map(d => ({
                tag: new Date(d.date).toLocaleDateString('de-DE', { weekday: 'short' }),
                Min: d.tempMin,
                Max: d.tempMax,
                Niederschlag: d.precipitation
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tag" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Max" fill="#ef4444" />
                <Bar dataKey="Min" fill="#3b82f6" />
                <Bar dataKey="Niederschlag" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {weather.daily.map((day, index) => (
              <Card key={index} className="p-4">
                <div className="text-center">
                  <p className="font-medium">
                    {new Date(day.date).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' })}
                  </p>
                  <div className="my-3">
                    {getWeatherIcon(day.cloudCover, day.precipitation)}
                  </div>
                  <div className="text-sm">
                    <span className="text-red-500">{day.tempMax.toFixed(0)}°</span>
                    <span className="mx-1">/</span>
                    <span className="text-blue-500">{day.tempMin.toFixed(0)}°</span>
                  </div>
                  {day.precipitation > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{day.precipitation.toFixed(1)}mm</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Energy Prediction */}
      {selectedTab === 'prediction' && (
        <div className="space-y-6">
          {/* Prediction Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Heizbedarf</p>
                <p className="text-2xl font-bold text-orange-500">
                  {formatNumber(prediction.heatingDemand)} kWh
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kühlbedarf</p>
                <p className="text-2xl font-bold text-blue-500">
                  {formatNumber(prediction.coolingDemand)} kWh
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Solarproduktion</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatNumber(prediction.solarProduction)} kWh
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gesamtverbrauch</p>
                <p className="text-2xl font-bold">
                  {formatNumber(prediction.totalConsumption)} kWh
                </p>
                <div className="mt-2">
                  <Badge variant={prediction.confidence > 80 ? 'success' : 'warning'}>
                    {prediction.confidence}% Genauigkeit
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Peak Load Time */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Erwartete Spitzenlast</h3>
              <Badge variant="default">
                {prediction.peakLoadTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
              </Badge>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Energieoptimierungs-Empfehlungen</h3>
            <div className="space-y-3">
              {prediction.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Energy Distribution Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Energieverteilung (Prognose)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={[
                { name: 'Heizbedarf', value: prediction.heatingDemand },
                { name: 'Kühlbedarf', value: prediction.coolingDemand },
                { name: 'Grundlast', value: prediction.totalConsumption - prediction.heatingDemand - prediction.coolingDemand },
                { name: 'Solarproduktion', value: -prediction.solarProduction }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Energie (kWh)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Weather Alerts */}
      {weather.alerts.length > 0 && (
        <Card className="p-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold">Wetterwarnungen</h3>
          </div>
          <div className="space-y-3">
            {weather.alerts.map((alert, index) => (
              <div key={index} className="border-l-4 border-yellow-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{alert.headline}</p>
                  <Badge variant={alert.severity === 'extreme' ? 'destructive' : alert.severity === 'severe' ? 'warning' : 'default'}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{alert.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(alert.start).toLocaleString('de-DE')} - {new Date(alert.end).toLocaleString('de-DE')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
});

WeatherDashboard.displayName = 'WeatherDashboard';