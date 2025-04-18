import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Attribution Rules
export const attributionRules = pgTable("attribution_rules", {
  id: serial("id").primaryKey(),
  latest_traffic_source: text("latest_traffic_source").notNull(),
  hs_latest_source_data_2: text("hs_latest_source_data_2"),  // Nullable
  gtm_summary: text("gtm_summary").notNull(),
  gtm_motion: text("gtm_motion").notNull(),
  gtm_medium: text("gtm_medium").notNull(),
  gtm_web_source: text("gtm_web_source").notNull(),
  gtm_term: text("gtm_term").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAttributionRuleSchema = createInsertSchema(attributionRules).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Webhook Activities (logs)
export const webhookActivities = pgTable("webhook_activities", {
  id: serial("id").primaryKey(),
  contact_email: text("contact_email").notNull(),
  contact_id: text("contact_id").notNull(),
  latest_traffic_source: text("latest_traffic_source").notNull().default("Unknown"),
  hs_latest_source_data_2: text("hs_latest_source_data_2"),
  applied_attribution: json("applied_attribution"),
  status: text("status").notNull(), // 'success', 'failed'
  error_message: text("error_message"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertWebhookActivitySchema = createInsertSchema(webhookActivities).omit({
  id: true,
  created_at: true,
});

// Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  hubspot_api_key: text("hubspot_api_key"),
  webhook_url: text("webhook_url").notNull(),
  webhook_secret: text("webhook_secret"),
  webhook_status: text("webhook_status").notNull().default("inactive"), // 'active', 'inactive'
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updated_at: true,
});

export const updateSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updated_at: true,
}).partial();

// Export types
export type AttributionRule = typeof attributionRules.$inferSelect;
export type InsertAttributionRule = z.infer<typeof insertAttributionRuleSchema>;

export type WebhookActivity = typeof webhookActivities.$inferSelect;
export type InsertWebhookActivity = z.infer<typeof insertWebhookActivitySchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;

// HubSpot property interfaces (not stored in DB)
export interface HubSpotProperty {
  name: string;
  label: string;
  description: string;
  groupName: string;
  type: string;
  fieldType: string;
}

export interface AttributionProperties {
  gtm_summary: HubSpotProperty;
  gtm_motion: HubSpotProperty;
  gtm_medium: HubSpotProperty;
  gtm_web_source: HubSpotProperty;
  gtm_term: HubSpotProperty;
}

// Default property definitions for HubSpot
export const defaultAttributionProperties: AttributionProperties = {
  gtm_summary: {
    name: "gtm_summary",
    label: "GTM Summary",
    description: "Compiled GTM attribution information",
    groupName: "contactinformation",
    type: "string",
    fieldType: "text"
  },
  gtm_motion: {
    name: "gtm_motion",
    label: "GTM Motion",
    description: "Motion component of GTM attribution (Inbound/Outbound)",
    groupName: "contactinformation",
    type: "string",
    fieldType: "text"
  },
  gtm_medium: {
    name: "gtm_medium",
    label: "GTM Medium",
    description: "Medium component of GTM attribution (Search/Social/etc)",
    groupName: "contactinformation",
    type: "string",
    fieldType: "text"
  },
  gtm_web_source: {
    name: "gtm_web_source",
    label: "GTM Web Source",
    description: "Source component of GTM attribution (Google/LinkedIn/etc)",
    groupName: "contactinformation",
    type: "string",
    fieldType: "text"
  },
  gtm_term: {
    name: "gtm_term",
    label: "GTM Term",
    description: "Term component of GTM attribution",
    groupName: "contactinformation",
    type: "string",
    fieldType: "text"
  }
};
