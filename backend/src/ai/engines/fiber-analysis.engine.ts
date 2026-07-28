import { Injectable } from '@nestjs/common';
import { FiberContext } from '../context/context-builder.service';

export interface FiberAnalysisResult {
  customer_name: string;
  topology_chain: string[];
  total_hops: number;
  health_score: number;
  issues: string[];
  recommendations: string[];
}

@Injectable()
export class FiberAnalysisEngine {
  analyze(context: FiberContext): FiberAnalysisResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let health_score = 100;

    if (!context.customer) {
      issues.push('Customer record not found in database.');
      health_score -= 50;
    }

    if (!context.odp) {
      issues.push('No ODP assigned to this customer. Fiber path is incomplete.');
      health_score -= 30;
      recommendations.push('Assign the customer to the nearest available ODP using the Nearest ODP tool.');
    }

    if (!context.olt) {
      issues.push('No active OLT detected in the system.');
      health_score -= 20;
      recommendations.push('Verify OLT infrastructure is deployed and registered.');
    }

    if (context.customer && !context.onu) {
      issues.push('Customer has no ONU device provisioned.');
      health_score -= 10;
      recommendations.push('Provision an ONU device for this customer via Customer ONU assignment.');
    }

    if (issues.length === 0) {
      recommendations.push('Fiber path is fully operational. No action required.');
    }

    return {
      customer_name: context.customer?.full_name || 'Unknown',
      topology_chain: context.topology,
      total_hops: context.topology.length,
      health_score: Math.max(0, health_score),
      issues,
      recommendations,
    };
  }
}
