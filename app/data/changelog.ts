export type ReleaseType = "major" | "minor" | "patch";

export interface ChangelogVersion {
  version: string;
  released: string;
  type: ReleaseType;
  summary: string;

  features?: string[];
  improvements?: string[];
  fixes?: string[];
  security?: string[];
  breaking?: string[];
}

export const changelog: ChangelogVersion[] = [
  {
    version: "v1.0.0",
    released: "04 August 2026",
    type: "major",

    summary: "Initial release of the Inquest Docs",

    features: [
      "Announcements section",
      "War HQ documentation",
      "Inquiry history documentation",
      "Guides section",
    ],

    improvements: ["Optimized navigation", "Mobile-friendly interface"],

    fixes: [],

    security: ["Authentication system"],

    breaking: [],
  },
];
