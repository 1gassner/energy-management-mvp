/**
 * Feature Flags and A/B Testing Framework
 */

export interface ExperimentVariant {
  id: string;
  name: string;
  weight: number; // 0-100 percentage
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: ExperimentVariant[];
  enabled: boolean;
  startDate?: string;
  endDate?: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage?: number;
  targetUsers?: string[];
  targetRoles?: string[];
}

class FeatureFlagsService {
  private flags: Map<string, FeatureFlag> = new Map();
  private experiments: Map<string, Experiment> = new Map();
  private userVariants: Map<string, string> = new Map();
  private userId: string | null = null;
  private userRole: string | null = null;

  constructor() {
    this.initializeFlags();
    this.initializeExperiments();
  }

  private initializeFlags() {
    // Default feature flags
    const defaultFlags: FeatureFlag[] = [
      {
        id: 'new-dashboard-ui',
        name: 'New Dashboard UI',
        description: 'Enhanced dashboard with better performance',
        enabled: false,
        rolloutPercentage: 20
      },
      {
        id: 'advanced-analytics',
        name: 'Advanced Analytics',
        description: 'AI-powered analytics features',
        enabled: true,
        targetRoles: ['admin', 'manager']
      },
      {
        id: 'offline-mode',
        name: 'Offline Mode',
        description: 'Full offline capability with sync',
        enabled: false,
        rolloutPercentage: 10
      },
      {
        id: 'virtual-scrolling',
        name: 'Virtual Scrolling',
        description: 'Performance optimization for large lists',
        enabled: true,
        rolloutPercentage: 100
      }
    ];

    defaultFlags.forEach(flag => {
      this.flags.set(flag.id, flag);
    });
  }

  private initializeExperiments() {
    // Default A/B experiments
    const defaultExperiments: Experiment[] = [
      {
        id: 'dashboard-layout',
        name: 'Dashboard Layout Test',
        description: 'Testing grid vs list layout',
        enabled: true,
        variants: [
          { id: 'control', name: 'Grid Layout', weight: 50 },
          { id: 'variant-a', name: 'List Layout', weight: 25 },
          { id: 'variant-b', name: 'Hybrid Layout', weight: 25 }
        ]
      },
      {
        id: 'chart-library',
        name: 'Chart Library Performance',
        description: 'Testing different chart rendering libraries',
        enabled: false,
        variants: [
          { id: 'control', name: 'Recharts', weight: 70 },
          { id: 'variant-a', name: 'Victory', weight: 30 }
        ]
      }
    ];

    defaultExperiments.forEach(exp => {
      this.experiments.set(exp.id, exp);
    });
  }

  setUser(userId: string, role?: string) {
    this.userId = userId;
    this.userRole = role || null;
    this.assignUserToExperiments();
  }

  private assignUserToExperiments() {
    if (!this.userId) return;

    this.experiments.forEach(experiment => {
      if (!experiment.enabled) return;

      // Use consistent hashing to assign user to variant
      const hash = this.hashCode(this.userId + experiment.id);
      const bucket = Math.abs(hash) % 100;
      
      let cumulativeWeight = 0;
      for (const variant of experiment.variants) {
        cumulativeWeight += variant.weight;
        if (bucket < cumulativeWeight) {
          this.userVariants.set(experiment.id, variant.id);
          break;
        }
      }
    });
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  isEnabled(flagId: string): boolean {
    const flag = this.flags.get(flagId);
    if (!flag || !flag.enabled) return false;

    // Check target users
    if (flag.targetUsers && this.userId) {
      if (!flag.targetUsers.includes(this.userId)) {
        return false;
      }
    }

    // Check target roles
    if (flag.targetRoles && this.userRole) {
      if (!flag.targetRoles.includes(this.userRole)) {
        return false;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      if (!this.userId) return false;
      const hash = this.hashCode(this.userId + flagId);
      const bucket = Math.abs(hash) % 100;
      return bucket < flag.rolloutPercentage;
    }

    return true;
  }

  getVariant(experimentId: string): string | null {
    if (!this.experiments.get(experimentId)?.enabled) {
      return null;
    }
    return this.userVariants.get(experimentId) || null;
  }

  trackEvent(eventName: string, properties?: Record<string, any>) {
    // Send to analytics service
    const eventData = {
      event: eventName,
      userId: this.userId,
      userRole: this.userRole,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        experiments: Object.fromEntries(this.userVariants),
        flags: Array.from(this.flags.keys()).filter(id => this.isEnabled(id))
      }
    };

    // In production, send to analytics service
    if (import.meta.env.PROD) {
      // Example: sendToAnalytics(eventData);
      console.log('Analytics event:', eventData);
    } else {
      console.log('Dev Analytics:', eventData);
    }
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  getAllExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }

  updateFlag(flagId: string, updates: Partial<FeatureFlag>) {
    const flag = this.flags.get(flagId);
    if (flag) {
      this.flags.set(flagId, { ...flag, ...updates });
    }
  }

  updateExperiment(experimentId: string, updates: Partial<Experiment>) {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      this.experiments.set(experimentId, { ...experiment, ...updates });
      // Reassign users if experiment changed
      if (this.userId) {
        this.assignUserToExperiments();
      }
    }
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagsService();

// React hook for feature flags
import { useState, useEffect } from 'react';

export const useFeatureFlag = (flagId: string): boolean => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(featureFlags.isEnabled(flagId));
  }, [flagId]);

  return enabled;
};

export const useExperiment = (experimentId: string): string | null => {
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    setVariant(featureFlags.getVariant(experimentId));
  }, [experimentId]);

  return variant;
};