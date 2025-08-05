import type { 
  AdvancedAnalyticsData, ExportConfiguration, ExportResult
} from '@/types';

// Export utility functions for analytics data
export class AnalyticsExporter {
  private static generateTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  private static formatNumber(value: number, decimals: number = 1): string {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  static async exportToPDF(
    data: AdvancedAnalyticsData,
    config: ExportConfiguration
  ): Promise<ExportResult> {
    try {
      // In a real implementation, this would use a PDF library like jsPDF
      // or send data to a backend service for PDF generation
      
      const reportContent = this.generateReportContent(data, config);
      const timestamp = this.generateTimestamp();
      const fileName = `analytics-report-${timestamp}.pdf`;

      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        downloadUrl: `/api/exports/${fileName}`,
        fileName,
        fileSize: Math.round(reportContent.length * 1.2), // Estimated PDF size
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
    } catch (error) {
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  static async exportToExcel(
    data: AdvancedAnalyticsData,
    config: ExportConfiguration
  ): Promise<ExportResult> {
    try {
      // In a real implementation, this would use a library like XLSX.js
      const workbookData = this.generateExcelWorkbook(data, config);
      const timestamp = this.generateTimestamp();
      const fileName = `analytics-data-${timestamp}.xlsx`;

      // Simulate Excel generation
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        success: true,
        downloadUrl: `/api/exports/${fileName}`,
        fileName,
        fileSize: Math.round(JSON.stringify(workbookData).length * 0.8),
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };
    } catch (error) {
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  static async exportToCSV(
    data: AdvancedAnalyticsData,
    config: ExportConfiguration
  ): Promise<ExportResult> {
    try {
      const csvData = this.generateCSVData(data, config);
      const timestamp = this.generateTimestamp();
      const fileName = `analytics-data-${timestamp}.csv`;

      // Simulate CSV generation
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        downloadUrl: `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`,
        fileName,
        fileSize: csvData.length,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };
    } catch (error) {
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  static async exportToJSON(
    data: AdvancedAnalyticsData,
    config: ExportConfiguration
  ): Promise<ExportResult> {
    try {
      const filteredData = this.filterDataByConfig(data, config);
      const jsonData = JSON.stringify(filteredData, null, 2);
      const timestamp = this.generateTimestamp();
      const fileName = `analytics-data-${timestamp}.json`;

      return {
        success: true,
        downloadUrl: `data:application/json;charset=utf-8,${encodeURIComponent(jsonData)}`,
        fileName,
        fileSize: jsonData.length,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  private static generateReportContent(
    data: AdvancedAnalyticsData,
    config: ExportConfiguration
  ): string {
    const sections: string[] = [];

    // Header
    sections.push(`CITYPULSE HECHINGEN - ANALYTICS REPORT`);
    sections.push(`Generiert am: ${new Date().toLocaleDateString('de-DE')}`);
    sections.push(`Zeitraum: ${config.timeRange.start} bis ${config.timeRange.end}`);
    sections.push('');

    // Executive Summary
    sections.push('ZUSAMMENFASSUNG');
    sections.push('='.repeat(50));
    sections.push(`Gesamtverbrauch: ${data.overview.totalEnergyConsumed.toLocaleString()} kWh`);
    sections.push(`Kosteneinsparungen: ${this.formatCurrency(data.overview.totalCostSavings)}`);
    sections.push(`CO₂-Reduktion: ${this.formatNumber(data.overview.co2ReductionTotal)} Tonnen`);
    sections.push(`Effizienzverbesserung: ${this.formatNumber(data.overview.efficiencyImprovement)}%`);
    sections.push(`Datenqualität: ${this.formatNumber(data.overview.dataQualityScore)}%`);
    sections.push('');

    // KPI Overview
    if (config.metrics.includes('kpi')) {
      sections.push('KEY PERFORMANCE INDICATORS');
      sections.push('='.repeat(50));
      
      data.kpiMetrics.energyKPIs.forEach(kpi => {
        sections.push(`${kpi.name}: ${this.formatNumber(kpi.currentValue)} ${kpi.unit} (Ziel: ${this.formatNumber(kpi.targetValue)} ${kpi.unit})`);
        sections.push(`  Trend: ${kpi.trend === 'improving' ? '↗' : kpi.trend === 'declining' ? '↘' : '→'} ${this.formatNumber(Math.abs(kpi.trendPercentage))}%`);
        sections.push(`  Performance: ${kpi.performance || 'N/A'}`);
      });
      sections.push('');
    }

    // AI Insights
    if (config.metrics.includes('insights')) {
      sections.push('KI-ERKENNTNISSE');
      sections.push('='.repeat(50));
      
      data.aiInsights.insights.slice(0, 5).forEach((insight, index) => {
        sections.push(`${index + 1}. ${insight.title}`);
        sections.push(`   ${insight.description}`);
        sections.push(`   Konfidenz: ${this.formatNumber(insight.confidence)}%`);
        sections.push(`   Impact: ${insight.impact}`);
        if (insight.potentialSavings) {
          sections.push(`   Einsparpotential: ${insight.potentialSavings.energy.toLocaleString()} kWh, ${this.formatCurrency(insight.potentialSavings.cost)}`);
        }
        sections.push('');
      });
    }

    // Building Performance
    if (config.metrics.includes('buildings')) {
      sections.push('GEBÄUDE-PERFORMANCE');
      sections.push('='.repeat(50));
      
      data.benchmarkData.buildingComparisons.forEach(building => {
        sections.push(`${building.buildingName} (Rang ${building.rank})`);
        sections.push(`  Gesamtscore: ${this.formatNumber(building.overallScore)}/100`);
        sections.push(`  Energieeffizienz: ${this.formatNumber(building.kpiScores.energyEfficiency)}/100`);
        sections.push(`  Kosteneffizienz: ${this.formatNumber(building.kpiScores.costEfficiency)}/100`);
        sections.push(`  Nachhaltigkeit: ${this.formatNumber(building.kpiScores.sustainability)}/100`);
        sections.push(`  ${building.topPerformer ? '⭐ Top-Performer' : ''}`);
        sections.push('');
      });
    }

    // Recommendations
    if (config.metrics.includes('recommendations')) {
      sections.push('EMPFEHLUNGEN');
      sections.push('='.repeat(50));
      
      data.aiInsights.recommendations.slice(0, 3).forEach((rec, index) => {
        sections.push(`${index + 1}. ${rec.title}`);
        sections.push(`   ${rec.description}`);
        sections.push(`   Priorität: ${rec.priority}`);
        sections.push(`   Erwarteter Impact: ${this.formatNumber(rec.expectedImpact.energy)} kWh, ${this.formatCurrency(rec.expectedImpact.cost)}`);
        sections.push(`   Komplexität: ${rec.implementationComplexity}`);
        sections.push('');
      });
    }

    return sections.join('\n');
  }

  private static generateExcelWorkbook(
    data: AdvancedAnalyticsData,
    _config: ExportConfiguration
  ): any {
    const workbook = {
      SheetNames: ['Übersicht', 'KPIs', 'Gebäude', 'Insights', 'Prognosen'],
      Sheets: {} as any
    };

    // Overview Sheet
    const overviewData = [
      ['Metrik', 'Wert', 'Einheit'],
      ['Gesamtverbrauch', data.overview.totalEnergyConsumed, 'kWh'],
      ['Kosteneinsparungen', data.overview.totalCostSavings, '€'],
      ['CO₂-Reduktion', data.overview.co2ReductionTotal, 't'],
      ['Effizienzverbesserung', data.overview.efficiencyImprovement, '%'],
      ['Optimierte Gebäude', data.overview.buildingsOptimized, 'Anzahl'],
      ['Aktive Insights', data.overview.activeInsights, 'Anzahl'],
      ['Datenqualität', data.overview.dataQualityScore, '%']
    ];

    // KPI Sheet
    const kpiData = [
      ['Name', 'Aktueller Wert', 'Zielwert', 'Einheit', 'Trend', 'Trend %', 'Performance']
    ];
    
    data.kpiMetrics.energyKPIs.forEach(kpi => {
      kpiData.push([
        kpi.name,
        kpi.currentValue.toString(),
        kpi.targetValue.toString(),
        kpi.unit,
        kpi.trend,
        kpi.trendPercentage.toString(),
        kpi.performance || ''
      ]);
    });

    // Building Performance Sheet
    const buildingData = [
      ['Gebäude', 'Rang', 'Gesamtscore', 'Energieeffizienz', 'Kosteneffizienz', 'Nachhaltigkeit', 'Automatisierung', 'Wartung', 'Nutzerzufriedenheit', 'Top Performer']
    ];
    
    data.benchmarkData.buildingComparisons.forEach(building => {
      buildingData.push([
        building.buildingName,
        building.rank.toString(),
        building.overallScore.toString(),
        building.kpiScores.energyEfficiency.toString(),
        building.kpiScores.costEfficiency.toString(),
        building.kpiScores.sustainability.toString(),
        building.kpiScores.automation.toString(),
        building.kpiScores.maintenance.toString(),
        building.kpiScores.userSatisfaction.toString(),
        building.topPerformer ? 'Ja' : 'Nein'
      ]);
    });

    // AI Insights Sheet
    const insightsData = [
      ['Typ', 'Titel', 'Beschreibung', 'Konfidenz', 'Impact', 'Kategorie', 'Gebäude', 'Status']
    ];
    
    data.aiInsights.insights.forEach(insight => {
      insightsData.push([
        insight.type,
        insight.title,
        insight.description,
        insight.confidence.toString(),
        insight.impact,
        insight.category,
        insight.buildingName || '',
        insight.status
      ]);
    });

    // Forecasts Sheet
    const forecastData = [
      ['Gebäude', 'Periode', 'Prognose (kWh)', 'Konfidenz', 'Optimistisch', 'Realistisch', 'Pessimistisch']
    ];
    
    data.predictiveModels.consumptionForecast.forEach(forecast => {
      forecastData.push([
        forecast.buildingName,
        forecast.forecastPeriod,
        forecast.predictedConsumption.toString(),
        forecast.confidence.toString(),
        forecast.scenarios.optimistic.toString(),
        forecast.scenarios.realistic.toString(),
        forecast.scenarios.pessimistic.toString()
      ]);
    });

    // Convert arrays to worksheet format (simplified)
    workbook.Sheets['Übersicht'] = this.arrayToWorksheet(overviewData);
    workbook.Sheets['KPIs'] = this.arrayToWorksheet(kpiData);
    workbook.Sheets['Gebäude'] = this.arrayToWorksheet(buildingData);
    workbook.Sheets['Insights'] = this.arrayToWorksheet(insightsData);
    workbook.Sheets['Prognosen'] = this.arrayToWorksheet(forecastData);

    return workbook;
  }

  private static arrayToWorksheet(data: any[][]): any {
    const worksheet: any = {};
    const range = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };

    for (let R = 0; R < data.length; R++) {
      for (let C = 0; C < data[R].length; C++) {
        if (range.e.c < C) range.e.c = C;
        if (range.e.r < R) range.e.r = R;

        const cellRef = this.encodeCell({ c: C, r: R });
        worksheet[cellRef] = { v: data[R][C] };
      }
    }

    worksheet['!ref'] = this.encodeRange(range);
    return worksheet;
  }

  private static encodeCell(cell: { c: number; r: number }): string {
    return String.fromCharCode(65 + cell.c) + (cell.r + 1);
  }

  private static encodeRange(range: any): string {
    return this.encodeCell(range.s) + ':' + this.encodeCell(range.e);
  }

  private static generateCSVData(
    data: AdvancedAnalyticsData,
    config: ExportConfiguration
  ): string {
    const rows: string[] = [];

    // Header
    rows.push('# CityPulse Hechingen Analytics Export');
    rows.push(`# Generiert am: ${new Date().toISOString()}`);
    rows.push(`# Zeitraum: ${config.timeRange.start} bis ${config.timeRange.end}`);
    rows.push('');

    // Overview Data
    rows.push('## Übersicht');
    rows.push('Metrik,Wert,Einheit');
    rows.push(`Gesamtverbrauch,${data.overview.totalEnergyConsumed},kWh`);
    rows.push(`Kosteneinsparungen,${data.overview.totalCostSavings},EUR`);
    rows.push(`CO2-Reduktion,${data.overview.co2ReductionTotal},t`);
    rows.push(`Effizienzverbesserung,${data.overview.efficiencyImprovement},%`);
    rows.push(`Datenqualität,${data.overview.dataQualityScore},%`);
    rows.push('');

    // Energy KPIs
    if (config.metrics.includes('kpi')) {
      rows.push('## Energie-KPIs');
      rows.push('Name,Aktueller Wert,Zielwert,Einheit,Trend,Trend %');
      data.kpiMetrics.energyKPIs.forEach(kpi => {
        rows.push(`"${kpi.name}",${kpi.currentValue},${kpi.targetValue},"${kpi.unit}","${kpi.trend}",${kpi.trendPercentage}`);
      });
      rows.push('');
    }

    // Building Performance
    if (config.metrics.includes('buildings')) {
      rows.push('## Gebäude-Performance');
      rows.push('Gebäude,Rang,Gesamtscore,Energieeffizienz,Kosteneffizienz,Nachhaltigkeit');
      data.benchmarkData.buildingComparisons.forEach(building => {
        rows.push(`"${building.buildingName}",${building.rank},${building.overallScore},${building.kpiScores.energyEfficiency},${building.kpiScores.costEfficiency},${building.kpiScores.sustainability}`);
      });
      rows.push('');
    }

    // Consumption Trends
    if (config.metrics.includes('consumption')) {
      rows.push('## Verbrauchstrends');
      rows.push('Gebäude,Periode,Verbrauch (kWh),Trend,Trend %');
      data.energyAnalytics.consumptionTrends.forEach(trend => {
        rows.push(`"${trend.buildingName}","${trend.period}",${trend.consumption},"${trend.trend}",${trend.trendPercentage}`);
      });
      rows.push('');
    }

    return rows.join('\n');
  }

  private static filterDataByConfig(
    data: AdvancedAnalyticsData,
    config: ExportConfiguration
  ): Partial<AdvancedAnalyticsData> {
    const filtered: Partial<AdvancedAnalyticsData> = {
      overview: data.overview
    };

    if (config.metrics.includes('consumption')) {
      filtered.energyAnalytics = data.energyAnalytics;
    }

    if (config.metrics.includes('predictions')) {
      filtered.predictiveModels = data.predictiveModels;
    }

    if (config.metrics.includes('buildings')) {
      filtered.benchmarkData = data.benchmarkData;
    }

    if (config.metrics.includes('insights')) {
      filtered.aiInsights = data.aiInsights;
    }

    if (config.metrics.includes('kpi')) {
      filtered.kpiMetrics = data.kpiMetrics;
    }

    // Filter by buildings if specified
    if (config.buildings.length > 0) {
      // Implementation would filter data by selected buildings
    }

    return filtered;
  }

  // Utility method for generating shareable reports
  static generateShareableLink(
    data: AdvancedAnalyticsData,
    config: ExportConfiguration
  ): string {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      timeRange: `${config.timeRange.start}:${config.timeRange.end}`,
      buildings: config.buildings.join(','),
      metrics: config.metrics.join(','),
      format: 'share'
    });

    return `${baseUrl}/analytics/shared?${params.toString()}`;
  }

  // Method to export specific chart data
  static exportChartData(
    chartData: any[],
    chartType: string,
    fileName?: string
  ): ExportResult {
    try {
      const timestamp = this.generateTimestamp();
      const csvData = this.convertChartDataToCSV(chartData, chartType);
      const finalFileName = fileName || `chart-data-${chartType}-${timestamp}.csv`;

      return {
        success: true,
        downloadUrl: `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`,
        fileName: finalFileName,
        fileSize: csvData.length,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Export-Fehler'
      };
    }
  }

  private static convertChartDataToCSV(data: any[], chartType: string): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const rows = [headers.join(',')];

    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      rows.push(values.join(','));
    });

    return `# Chart Data Export - ${chartType}\n# Generated: ${new Date().toISOString()}\n\n${rows.join('\n')}`;
  }
}

// Export convenience functions
export const exportAnalyticsToPDF = (data: AdvancedAnalyticsData, config: ExportConfiguration) =>
  AnalyticsExporter.exportToPDF(data, config);

export const exportAnalyticsToExcel = (data: AdvancedAnalyticsData, config: ExportConfiguration) =>
  AnalyticsExporter.exportToExcel(data, config);

export const exportAnalyticsToCSV = (data: AdvancedAnalyticsData, config: ExportConfiguration) =>
  AnalyticsExporter.exportToCSV(data, config);

export const exportAnalyticsToJSON = (data: AdvancedAnalyticsData, config: ExportConfiguration) =>
  AnalyticsExporter.exportToJSON(data, config);

export default AnalyticsExporter;