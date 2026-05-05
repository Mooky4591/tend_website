export const REMINDER_TYPES = [
  'hvac_filter',
  'hvac_service',
  'water_heater_flush',
  'roof_inspection',
  'gutter_cleaning',
  'plumbing_inspection',
  'electrical_inspection',
  'other',
] as const

export type ReminderType = typeof REMINDER_TYPES[number]
