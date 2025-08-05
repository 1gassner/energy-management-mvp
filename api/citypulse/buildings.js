export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Mock data for 7 buildings in Hechingen
  const buildings = [
    {
      id: 'rathaus',
      name: 'Rathaus Hechingen',
      address: 'Marktplatz 1, 72379 Hechingen',
      type: 'administrative',
      area: 2500, // m²
      floors: 3,
      sensors: {
        total: 125,
        energy: 45,
        temperature: 30,
        humidity: 25,
        occupancy: 15,
        air_quality: 10
      },
      current_consumption: {
        electricity: 245.5, // kWh
        heating: 180.2,
        cooling: 45.8,
        total: 471.5
      },
      status: 'optimal',
      efficiency_score: 8.7,
      last_updated: new Date().toISOString()
    },
    {
      id: 'stadtwerke',
      name: 'Stadtwerke Zentrale',
      address: 'Energiestraße 5, 72379 Hechingen',
      type: 'utility',
      area: 1800,
      floors: 2,
      sensors: {
        total: 95,
        energy: 35,
        temperature: 25,
        humidity: 15,
        occupancy: 12,
        air_quality: 8
      },
      current_consumption: {
        electricity: 320.1,
        heating: 95.4,
        cooling: 25.2,
        total: 440.7
      },
      status: 'good',
      efficiency_score: 8.2,
      last_updated: new Date().toISOString()
    },
    {
      id: 'kulturzentrum',
      name: 'Kulturzentrum',
      address: 'Kulturplatz 3, 72379 Hechingen',
      type: 'cultural',
      area: 3200,
      floors: 2,
      sensors: {
        total: 140,
        energy: 55,
        temperature: 35,
        humidity: 25,
        occupancy: 20,
        air_quality: 5
      },
      current_consumption: {
        electricity: 480.3,
        heating: 220.8,
        cooling: 85.1,
        total: 786.2
      },
      status: 'attention',
      efficiency_score: 7.1,
      last_updated: new Date().toISOString()
    },
    {
      id: 'sporthalle',
      name: 'Sporthalle Nord',
      address: 'Sportweg 12, 72379 Hechingen',
      type: 'sports',
      area: 2800,
      floors: 1,
      sensors: {
        total: 110,
        energy: 40,
        temperature: 30,
        humidity: 20,
        occupancy: 15,
        air_quality: 5
      },
      current_consumption: {
        electricity: 195.7,
        heating: 145.3,
        cooling: 65.4,
        total: 406.4
      },
      status: 'optimal',
      efficiency_score: 8.9,
      last_updated: new Date().toISOString()
    },
    {
      id: 'grundschule',
      name: 'Grundschule Mitte',
      address: 'Schulstraße 8, 72379 Hechingen',
      type: 'educational',
      area: 2200,
      floors: 2,
      sensors: {
        total: 85,
        energy: 30,
        temperature: 25,
        humidity: 15,
        occupancy: 10,
        air_quality: 5
      },
      current_consumption: {
        electricity: 165.2,
        heating: 120.8,
        cooling: 35.1,
        total: 321.1
      },
      status: 'good',
      efficiency_score: 8.4,
      last_updated: new Date().toISOString()
    },
    {
      id: 'verwaltung',
      name: 'Verwaltungsgebäude',
      address: 'Amtsstraße 4, 72379 Hechingen',
      type: 'administrative',
      area: 1900,
      floors: 3,
      sensors: {
        total: 95,
        energy: 35,
        temperature: 25,
        humidity: 20,
        occupancy: 10,
        air_quality: 5
      },
      current_consumption: {
        electricity: 210.4,
        heating: 85.6,
        cooling: 42.3,
        total: 338.3
      },
      status: 'optimal',
      efficiency_score: 8.6,
      last_updated: new Date().toISOString()
    },
    {
      id: 'bibliothek',
      name: 'Bibliothek',
      address: 'Büchergasse 7, 72379 Hechingen',
      type: 'cultural',
      area: 1200,
      floors: 2,
      sensors: {
        total: 95,
        energy: 25,
        temperature: 20,
        humidity: 15,
        occupancy: 25,
        air_quality: 10
      },
      current_consumption: {
        electricity: 125.8,
        heating: 75.2,
        cooling: 15.4,
        total: 216.4
      },
      status: 'good',
      efficiency_score: 8.0,
      last_updated: new Date().toISOString()
    }
  ];

  // Calculate totals
  const totals = buildings.reduce((acc, building) => {
    acc.total_sensors += building.sensors.total;
    acc.total_consumption += building.current_consumption.total;
    acc.total_area += building.area;
    return acc;
  }, {
    total_sensors: 0,
    total_consumption: 0,
    total_area: 0,
    buildings_count: buildings.length
  });

  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    city: 'Hechingen',
    project: 'Energy Management MVP',
    totals,
    buildings,
    meta: {
      total_buildings: buildings.length,
      total_sensors: totals.total_sensors,
      average_efficiency: (buildings.reduce((sum, b) => sum + b.efficiency_score, 0) / buildings.length).toFixed(1),
      data_source: 'mock_data_for_mvp',
      update_interval: '30_seconds'
    }
  });
}