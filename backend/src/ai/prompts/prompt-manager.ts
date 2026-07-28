export type PromptType = 'CHAT' | 'FIBER_TRACE' | 'NEAREST_ODP' | 'CAPACITY' | 'NETWORK' | 'RECOMMENDATION' | 'CUSTOMER';

export interface PromptTemplate {
  type: PromptType;
  systemInstruction: string;
  responseFormat: string;
}

const PROMPTS: Record<PromptType, PromptTemplate> = {
  CHAT: {
    type: 'CHAT',
    systemInstruction: `You are the FAMS AI Assistant, an expert in Fiber-To-The-Home (FTTH) network management. 
You help NOC engineers and field technicians understand their network topology, diagnose issues, and plan capacity.
Answer questions using ONLY the provided network context data. Never invent data.`,
    responseFormat: 'conversational',
  },
  FIBER_TRACE: {
    type: 'FIBER_TRACE',
    systemInstruction: `Analyze the fiber path from Customer to OLT. 
Identify every node in the topology chain: Customer → ONU → ODP → Splitter → Closure → Fiber Cable → ODC → OLT.
Flag any missing links or anomalies.`,
    responseFormat: 'structured_trace',
  },
  NEAREST_ODP: {
    type: 'NEAREST_ODP',
    systemInstruction: `Given a geographic coordinate, identify the nearest ODPs with available ports.
Rank results by distance (ascending). Only include ODPs with at least 1 free port.
Return the top 5 candidates with distance in meters.`,
    responseFormat: 'ranked_list',
  },
  CAPACITY: {
    type: 'CAPACITY',
    systemInstruction: `Analyze the current network capacity utilization across all ODPs and OLTs.
Identify bottlenecks where port usage exceeds 80%.
Recommend expansion priorities.`,
    responseFormat: 'capacity_report',
  },
  NETWORK: {
    type: 'NETWORK',
    systemInstruction: `Provide a comprehensive network health assessment.
Include: total assets, active alarms, offline devices, pending work orders, and overall health score.
Identify the top 3 areas requiring immediate attention.`,
    responseFormat: 'health_report',
  },
  RECOMMENDATION: {
    type: 'RECOMMENDATION',
    systemInstruction: `Based on the current network state, generate prioritized operational recommendations.
Categories: CAPACITY, MAINTENANCE, CUSTOMER_EXPERIENCE, COST_OPTIMIZATION.
Each recommendation must include: title, priority (HIGH/MEDIUM/LOW), category, and actionable description.`,
    responseFormat: 'recommendation_list',
  },
  CUSTOMER: {
    type: 'CUSTOMER',
    systemInstruction: `Analyze the customer's subscription profile, ONU signal health, and service history.
Identify potential issues (signal degradation, overdue payments, frequent complaints).
Recommend actions to improve retention and service quality.`,
    responseFormat: 'customer_report',
  },
};

export class PromptManager {
  static getPrompt(type: PromptType): PromptTemplate {
    return PROMPTS[type];
  }

  static getAllPrompts(): PromptTemplate[] {
    return Object.values(PROMPTS);
  }

  static buildPromptWithContext(type: PromptType, context: Record<string, any>): string {
    const template = PROMPTS[type];
    const contextBlock = Object.entries(context)
      .map(([key, value]) => `### ${key}\n${JSON.stringify(value, null, 2)}`)
      .join('\n\n');

    return `${template.systemInstruction}\n\n---\n\n# LIVE CONTEXT DATA\n\n${contextBlock}`;
  }
}
