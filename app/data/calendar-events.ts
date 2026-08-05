export interface CalendarEvent {
  id: string;
  title: string;
  /** ISO date string, e.g. '2026-08-15' */
  start: string;
  /** ISO date string, inclusive. Omit for single-day events. */
  end?: string;
  description?: string;
  location?: string;
  /**
   * Any Nuxt UI color token: primary, secondary, success, warning, error, info, neutral
   * (or any custom color you've registered in app.config.ts)
   */
  color?: string;
}

/**
 * Add / edit / remove events here. Nothing else in the calendar
 * needs to change — the component reads straight from this list.
 */
export const calendarEvents: CalendarEvent[] = [
  {
    id: "training3start",
    title: "Training Break Starts",
    start: "2026-09-01",
    color: "info",
    description: "Third Training Break",
  },
  {
    id: "training3end",
    title: "Training Break Ends",
    start: "2026-09-30",
    color: "info",
    description: "Third Training Break",
  },
  {
    id: "steadfast4",
    title: "Steadfast Switch 16% DEX, 15% STR",
    start: "2026-10-01",
    color: "error",
    description: "Quarterly Steadfast Shift till end of December 2026",
  },
  {
    id: "event12",
    title: "Racing Tournament",
    start: "2026-08-21",
    end: "2026-08-23",
    color: "warning",
    description: "Faction Racingg Tournament",
  },
];
