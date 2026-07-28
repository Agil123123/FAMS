import { Injectable } from '@nestjs/common';
import { CapacityContext, NetworkContext } from '../context/context-builder.service';

export interface Recommendation {
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'CAPACITY' | 'MAINTENANCE' | 'CUSTOMER_EXPERIENCE' | 'COST_OPTIMIZATION';
  description: string;
}

export interface RecommendationResult {
  generated_at: string;
  total_recommendations: number;
  recommendations: Recommendation[];
}

@Injectable()
export class RecommendationEngine {
  generate(capacity: CapacityContext, network: NetworkContext): RecommendationResult {
    const recommendations: Recommendation[] = [];

    // Capacity: find ODPs with high customer density
    const overloaded = capacity.customers_per_odp.filter((o) => o.customer_count >= 12);
    if (overloaded.length > 0) {
      recommendations.push({
        title: `${overloaded.length} ODP(s) have ≥12 customers connected`,
        priority: 'HIGH',
        category: 'CAPACITY',
        description: `High-density ODPs: ${overloaded.map((o) => `${o.odp_name} (${o.customer_count})`).join(', ')}. Consider deploying additional splitters or new ODPs.`,
      });
    }

    if (capacity.total_customers > 0 && capacity.total_odps > 0) {
      const avg = capacity.total_customers / capacity.total_odps;
      if (avg > 8) {
        recommendations.push({
          title: 'Elevated average customer density per ODP',
          priority: 'MEDIUM',
          category: 'CAPACITY',
          description: `Average of ${avg.toFixed(1)} customers per ODP. Monitor growth and plan preemptive expansion.`,
        });
      }
    }

    // Maintenance
    if (network.active_alarms > 5) {
      recommendations.push({
        title: `${network.active_alarms} unresolved alarms require immediate attention`,
        priority: 'HIGH',
        category: 'MAINTENANCE',
        description: 'Multiple active alarms indicate systemic issues. Prioritize alarm triage and dispatch field teams.',
      });
    } else if (network.active_alarms > 0) {
      recommendations.push({
        title: `${network.active_alarms} active alarm(s) pending resolution`,
        priority: 'MEDIUM',
        category: 'MAINTENANCE',
        description: 'Review and resolve outstanding alarms to maintain SLA compliance.',
      });
    }

    if (network.offline_devices > 0) {
      recommendations.push({
        title: `${network.offline_devices} device(s) offline`,
        priority: 'HIGH',
        category: 'MAINTENANCE',
        description: 'Offline devices may affect customer connectivity. Verify power and network links.',
      });
    }

    // Customer experience
    if (network.pending_work_orders > 10) {
      recommendations.push({
        title: 'Work order backlog exceeds threshold',
        priority: 'MEDIUM',
        category: 'CUSTOMER_EXPERIENCE',
        description: `${network.pending_work_orders} pending work orders. Consider increasing field capacity or prioritizing critical requests.`,
      });
    }

    // Cost optimization
    if (network.health_score >= 95 && network.active_alarms === 0 && overloaded.length === 0) {
      recommendations.push({
        title: 'Network operating at optimal efficiency',
        priority: 'LOW',
        category: 'COST_OPTIMIZATION',
        description: 'All systems healthy. Review vendor contracts for potential savings.',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: 'No critical actions required',
        priority: 'LOW',
        category: 'MAINTENANCE',
        description: 'Network operating within normal parameters. Continue routine monitoring.',
      });
    }

    return {
      generated_at: new Date().toISOString(),
      total_recommendations: recommendations.length,
      recommendations: recommendations.sort((a, b) => {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return order[a.priority] - order[b.priority];
      }),
    };
  }
}
