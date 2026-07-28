import { Injectable } from '@nestjs/common';
import { CustomerContext } from '../context/context-builder.service';

export interface CustomerAnalysisResult {
  customer_name: string;
  status: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  findings: string[];
  recommendations: string[];
}

@Injectable()
export class CustomerAnalysisEngine {
  analyze(context: CustomerContext): CustomerAnalysisResult {
    const findings: string[] = [];
    const recommendations: string[] = [];
    let risk_level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    if (!context.customer) {
      return {
        customer_name: 'Unknown',
        status: 'NOT_FOUND',
        risk_level: 'HIGH',
        findings: ['Customer not found in database.'],
        recommendations: ['Verify customer ID is correct.'],
      };
    }

    const customer = context.customer;

    if (customer.status === 'SUSPENDED') {
      findings.push('Customer account is currently SUSPENDED.');
      risk_level = 'HIGH';
      recommendations.push('Review suspension reason and contact customer for resolution.');
    } else if (customer.status === 'TERMINATED') {
      findings.push('Customer has been TERMINATED.');
      risk_level = 'MEDIUM';
      recommendations.push('Check if customer is eligible for reactivation.');
    } else {
      findings.push(`Customer is active with status: ${customer.status}.`);
    }

    if (!context.onu) {
      findings.push('No ONU device provisioned for this customer.');
      risk_level = risk_level === 'LOW' ? 'MEDIUM' : risk_level;
      recommendations.push('Provision ONU and schedule installation work order.');
    } else {
      findings.push(`ONU provisioned: ${context.onu.serial_number}.`);
    }

    if (!customer.odp_id) {
      findings.push('Customer not assigned to any ODP.');
      risk_level = 'HIGH';
      recommendations.push('Run Nearest ODP analysis and assign the customer.');
    }

    if (context.work_orders.length > 3) {
      findings.push(`${context.work_orders.length} recent work orders detected — possible recurring issue.`);
      risk_level = risk_level === 'LOW' ? 'MEDIUM' : risk_level;
      recommendations.push('Investigate root cause of frequent dispatch requests.');
    }

    if (context.alarm_count > 0) {
      findings.push(`${context.alarm_count} active alarms in the system that may affect this customer.`);
      recommendations.push('Cross-reference alarms with customer ODP/OLT path.');
    }

    if (findings.length <= 2 && risk_level === 'LOW') {
      recommendations.push('Customer profile is healthy. No immediate action required.');
    }

    return {
      customer_name: customer.full_name,
      status: customer.status,
      risk_level,
      findings,
      recommendations,
    };
  }
}
