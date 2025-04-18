import { 
  AttributionRule, InsertAttributionRule, 
  WebhookActivity, InsertWebhookActivity,
  Settings, InsertSettings, UpdateSettings
} from "@shared/schema";
// Para la implementación de base de datos
import * as schema from "@shared/schema";
import { db } from './db';
import { eq, desc, and, or, isNull, asc } from 'drizzle-orm';

// Interface for our storage operations
export interface IStorage {
  // Attribution rules
  getAllAttributionRules(): Promise<AttributionRule[]>;
  getAttributionRule(id: number): Promise<AttributionRule | undefined>;
  createAttributionRule(rule: InsertAttributionRule): Promise<AttributionRule>;
  updateAttributionRule(id: number, rule: Partial<InsertAttributionRule>): Promise<AttributionRule | undefined>;
  deleteAttributionRule(id: number): Promise<boolean>;
  findMatchingRule(latestTrafficSource: string, drillDown2?: string): Promise<AttributionRule | undefined>;
  
  // Webhook activities
  getAllWebhookActivities(limit?: number): Promise<WebhookActivity[]>;
  createWebhookActivity(activity: InsertWebhookActivity): Promise<WebhookActivity>;
  
  // Settings
  getSettings(): Promise<Settings | undefined>;
  createOrUpdateSettings(settings: UpdateSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private attributionRules: Map<number, AttributionRule>;
  private webhookActivities: Map<number, WebhookActivity>;
  private appSettings: Settings | undefined;
  
  private ruleId: number = 1;
  private activityId: number = 1;
  
  constructor() {
    this.attributionRules = new Map();
    this.webhookActivities = new Map();
    
    // Seed with some default attribution rules
    this.seedAttributionRules();
  }
  
  // Attribution Rules
  async getAllAttributionRules(): Promise<AttributionRule[]> {
    return Array.from(this.attributionRules.values());
  }
  
  async getAttributionRule(id: number): Promise<AttributionRule | undefined> {
    return this.attributionRules.get(id);
  }
  
  async createAttributionRule(rule: InsertAttributionRule): Promise<AttributionRule> {
    const now = new Date();
    const newRule: AttributionRule = {
      ...rule,
      id: this.ruleId++,
      hs_latest_source_data_2: rule.hs_latest_source_data_2 ?? null, // Ensure it's never undefined
      created_at: now,
      updated_at: now
    };
    
    this.attributionRules.set(newRule.id, newRule);
    return newRule;
  }
  
  async updateAttributionRule(id: number, rule: Partial<InsertAttributionRule>): Promise<AttributionRule | undefined> {
    const existingRule = this.attributionRules.get(id);
    
    if (!existingRule) {
      return undefined;
    }
    
    const updatedRule: AttributionRule = {
      ...existingRule,
      ...rule,
      updated_at: new Date()
    };
    
    this.attributionRules.set(id, updatedRule);
    return updatedRule;
  }
  
  async deleteAttributionRule(id: number): Promise<boolean> {
    return this.attributionRules.delete(id);
  }
  
  async findMatchingRule(latestTrafficSource: string, drillDown2?: string): Promise<AttributionRule | undefined> {
    const rules = Array.from(this.attributionRules.values());
    
    // First try to find exact match with both fields
    if (drillDown2) {
      const exactMatch = rules.find(rule => 
        rule.latest_traffic_source === latestTrafficSource && 
        rule.hs_latest_source_data_2 === drillDown2
      );
      
      if (exactMatch) return exactMatch;
    }
    
    // Fall back to matching just latest traffic source with null/empty hs_latest_source_data_2
    return rules.find(rule => 
      rule.latest_traffic_source === latestTrafficSource && 
      (!rule.hs_latest_source_data_2 || rule.hs_latest_source_data_2 === '')
    );
  }
  
  // Webhook Activities
  async getAllWebhookActivities(limit?: number): Promise<WebhookActivity[]> {
    const activities = Array.from(this.webhookActivities.values());
    activities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return limit ? activities.slice(0, limit) : activities;
  }
  
  async createWebhookActivity(activity: InsertWebhookActivity): Promise<WebhookActivity> {
    // Ensure all required fields have values
    const newActivity: WebhookActivity = {
      id: this.activityId++,
      contact_email: activity.contact_email,
      contact_id: activity.contact_id,
      latest_traffic_source: activity.latest_traffic_source || "Unknown",
      hs_latest_source_data_2: activity.hs_latest_source_data_2 || null,
      applied_attribution: activity.applied_attribution || null,
      status: activity.status,
      error_message: activity.error_message || null,
      created_at: new Date()
    };
    
    this.webhookActivities.set(newActivity.id, newActivity);
    return newActivity;
  }
  
  // Settings
  async getSettings(): Promise<Settings | undefined> {
    return this.appSettings;
  }
  
  async createOrUpdateSettings(settings: UpdateSettings): Promise<Settings> {
    const now = new Date();
    
    if (!this.appSettings) {
      // Create new settings
      this.appSettings = {
        id: 1,
        hubspot_api_key: settings.hubspot_api_key || '',
        webhook_url: settings.webhook_url || 'https://your-app-url/api/webhook',
        webhook_secret: settings.webhook_secret || '',
        webhook_status: settings.webhook_status || 'inactive',
        updated_at: now
      };
    } else {
      // Update existing settings
      this.appSettings = {
        ...this.appSettings,
        ...settings,
        updated_at: now
      };
    }
    
    return this.appSettings;
  }
  
  // Seed with default attribution rules
  private seedAttributionRules() {
    const defaultRules: InsertAttributionRule[] = [
      {
        latest_traffic_source: "Organic Search",
        hs_latest_source_data_2: "Google",
        gtm_summary: "Inbound | Search | Google",
        gtm_motion: "Inbound",
        gtm_medium: "Search",
        gtm_web_source: "Google",
        gtm_term: "Source Drill-Down 2"
      },
      {
        latest_traffic_source: "Organic Search",
        hs_latest_source_data_2: "Bing",
        gtm_summary: "Inbound | Search | Bing",
        gtm_motion: "Inbound",
        gtm_medium: "Search",
        gtm_web_source: "Bing",
        gtm_term: "Source Drill-Down 2"
      },
      {
        latest_traffic_source: "Paid Search",
        hs_latest_source_data_2: "Google",
        gtm_summary: "Outbound | Search | Google",
        gtm_motion: "Outbound",
        gtm_medium: "Search",
        gtm_web_source: "Google",
        gtm_term: "Source Drill-Down 2"
      },
      {
        latest_traffic_source: "Social Media",
        hs_latest_source_data_2: "LinkedIn",
        gtm_summary: "Inbound | Social | LinkedIn",
        gtm_motion: "Inbound",
        gtm_medium: "Social",
        gtm_web_source: "LinkedIn",
        gtm_term: "Source Drill-Down 2"
      },
      {
        latest_traffic_source: "Social Media",
        hs_latest_source_data_2: "Twitter",
        gtm_summary: "Inbound | Social | Twitter",
        gtm_motion: "Inbound",
        gtm_medium: "Social",
        gtm_web_source: "Twitter",
        gtm_term: "Source Drill-Down 2"
      },
      {
        latest_traffic_source: "Email Marketing",
        gtm_summary: "Outbound | Email | Newsletter",
        gtm_motion: "Outbound",
        gtm_medium: "Email",
        gtm_web_source: "Newsletter",
        gtm_term: "Email Campaign"
      },
      {
        latest_traffic_source: "Direct",
        gtm_summary: "Direct | None | None",
        gtm_motion: "Direct",
        gtm_medium: "None",
        gtm_web_source: "None",
        gtm_term: "Direct Traffic"
      },
      {
        latest_traffic_source: "Referral",
        gtm_summary: "Inbound | Referral | Website",
        gtm_motion: "Inbound",
        gtm_medium: "Referral",
        gtm_web_source: "Website",
        gtm_term: "Source Drill-Down 2"
      }
    ];
    
    // Add default rules to the storage
    defaultRules.forEach(rule => {
      this.createAttributionRule(rule);
    });
  }
}

// Implementación de almacenamiento en base de datos
export class DatabaseStorage implements IStorage {
  // Attribution Rules
  async getAllAttributionRules(): Promise<AttributionRule[]> {
    return db.select().from(schema.attributionRules);
  }
  
  async getAttributionRule(id: number): Promise<AttributionRule | undefined> {
    const [rule] = await db.select().from(schema.attributionRules).where(eq(schema.attributionRules.id, id));
    return rule;
  }
  
  async createAttributionRule(rule: InsertAttributionRule): Promise<AttributionRule> {
    const [newRule] = await db.insert(schema.attributionRules)
      .values(rule)
      .returning();
    return newRule;
  }
  
  async updateAttributionRule(id: number, rule: Partial<InsertAttributionRule>): Promise<AttributionRule | undefined> {
    const [updatedRule] = await db.update(schema.attributionRules)
      .set({ ...rule, updated_at: new Date() })
      .where(eq(schema.attributionRules.id, id))
      .returning();
    return updatedRule;
  }
  
  async deleteAttributionRule(id: number): Promise<boolean> {
    const result = await db.delete(schema.attributionRules)
      .where(eq(schema.attributionRules.id, id));
    return true; // Simplified return, assuming operation succeeded
  }
  
  async findMatchingRule(latestTrafficSource: string, drillDown2?: string): Promise<AttributionRule | undefined> {
    try {
      // Primero buscar coincidencia exacta con ambos campos
      if (drillDown2) {
        const exactMatches = await db.select()
          .from(schema.attributionRules)
          .where(and(
            eq(schema.attributionRules.latest_traffic_source, latestTrafficSource),
            eq(schema.attributionRules.hs_latest_source_data_2, drillDown2)
          ));
        
        if (exactMatches.length > 0) return exactMatches[0];
      }
      
      // Buscar coincidencia sin drill_down_2 o con valor nulo/vacío
      const fallbackMatches = await db.select()
        .from(schema.attributionRules)
        .where(and(
          eq(schema.attributionRules.latest_traffic_source, latestTrafficSource),
          or(
            isNull(schema.attributionRules.hs_latest_source_data_2),
            eq(schema.attributionRules.hs_latest_source_data_2, '')
          )
        ));
      
      return fallbackMatches.length > 0 ? fallbackMatches[0] : undefined;
    } catch (error) {
      console.error('Error finding matching rule:', error);
      return undefined;
    }
  }
  
  // Webhook Activities
  async getAllWebhookActivities(limit?: number): Promise<WebhookActivity[]> {
    try {
      // Ejecución de consulta con o sin límite
      if (limit) {
        return await db.select()
          .from(schema.webhookActivities)
          .orderBy(desc(schema.webhookActivities.created_at))
          .limit(limit);
      } else {
        return await db.select()
          .from(schema.webhookActivities)
          .orderBy(desc(schema.webhookActivities.created_at));
      }
    } catch (error) {
      console.error('Error getting webhook activities:', error);
      return [];
    }
  }
  
  async createWebhookActivity(activity: InsertWebhookActivity): Promise<WebhookActivity> {
    const [newActivity] = await db.insert(schema.webhookActivities)
      .values(activity)
      .returning();
    return newActivity;
  }
  
  // Settings
  async getSettings(): Promise<Settings | undefined> {
    const [settings] = await db.select().from(schema.settings);
    return settings;
  }
  
  async createOrUpdateSettings(settings: UpdateSettings): Promise<Settings> {
    // Obtener configuración existente
    const [existingSettings] = await db.select().from(schema.settings);
    
    if (existingSettings) {
      // Actualizar
      const [updatedSettings] = await db.update(schema.settings)
        .set({ ...settings, updated_at: new Date() })
        .where(eq(schema.settings.id, existingSettings.id))
        .returning();
      return updatedSettings;
    } else {
      // Crear nueva
      const [newSettings] = await db.insert(schema.settings)
        .values({
          ...settings,
          webhook_url: settings.webhook_url || 'https://your-app-url/api/webhook',
          webhook_status: settings.webhook_status || 'inactive'
        })
        .returning();
      return newSettings;
    }
  }
}

// Determinar qué almacenamiento usar
let storage: IStorage;

// Mostrar las variables de entorno para depuración
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('USE_DATABASE:', process.env.USE_DATABASE);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

// Para propósitos de prueba, forzamos el uso de almacenamiento en base de datos
// cuando la variable de entorno DATABASE_URL está disponible
if (process.env.DATABASE_URL) {
  console.log('Using database storage (DATABASE_URL is available)');
  storage = new DatabaseStorage();
} else {
  console.log('Using memory storage (DATABASE_URL not found)');
  storage = new MemStorage();
}

export { storage };