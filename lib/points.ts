export type PointLogType =
  | "attendance"
  | "presentation"
  | "project_update"
  | "project_funded"
  | "event_1st"
  | "event_2nd"
  | "event_special"
  | "event_participation"
  | "industry_offered"
  | "industry_applied"
  | "cie_bonus"
  | "streak_bonus"
  | "mentor_bonus"
  | "referral_bonus"
  | "century_spend"
  | "deduction"
  | "manual_award"
  | "hackathon_first"
  | "hackathon_second"
  | "hackathon_special"
  | "hackathon_participation";

export type PointDirection = "award" | "deduction" | "system";

export interface PointRule {
  type: PointLogType;
  label: string;
  description: string;
  defaultPoints: number;
  direction: PointDirection;
  requiresNote?: boolean;
  adminSelectable?: boolean;
  bulkSelectable?: boolean;
}

export const POINT_RULES: PointRule[] = [
  {
    type: "manual_award",
    label: "Manual Award",
    description: "Admin-only adjustment for approved special contributions.",
    defaultPoints: 10,
    direction: "award",
    requiresNote: true,
    adminSelectable: true,
    bulkSelectable: true,
  },
  {
    type: "deduction",
    label: "Point Deduction",
    description: "Penalty or correction. Requires an audit note.",
    defaultPoints: -5,
    direction: "deduction",
    requiresNote: true,
    adminSelectable: true,
    bulkSelectable: false,
  },
  {
    type: "attendance",
    label: "Meeting Attendance",
    description: "Standard meeting attendance credit.",
    defaultPoints: 1,
    direction: "award",
    adminSelectable: true,
    bulkSelectable: true,
  },
  {
    type: "presentation",
    label: "Presentation",
    description: "Student presentation in a chapter meeting.",
    defaultPoints: 2,
    direction: "award",
    adminSelectable: true,
    bulkSelectable: true,
  },
  {
    type: "project_update",
    label: "Project Update",
    description: "Confirmed weekly project progress update.",
    defaultPoints: 1,
    direction: "award",
    adminSelectable: true,
    bulkSelectable: true,
  },
  {
    type: "project_funded",
    label: "Project Funded",
    description: "External funding or grant approval.",
    defaultPoints: 5,
    direction: "award",
    adminSelectable: true,
    bulkSelectable: false,
  },
  {
    type: "event_1st",
    label: "Event 1st Place",
    description: "Competition or hackathon first-place result.",
    defaultPoints: 5,
    direction: "award",
    adminSelectable: true,
    bulkSelectable: true,
  },
  {
    type: "event_2nd",
    label: "Event 2nd Place",
    description: "Competition or hackathon second-place result.",
    defaultPoints: 3,
    direction: "award",
    adminSelectable: true,
    bulkSelectable: true,
  },
  {
    type: "event_special",
    label: "Special Mention",
    description: "Special jury mention or category recognition.",
    defaultPoints: 2,
    direction: "award",
    adminSelectable: true,
    bulkSelectable: true,
  },
  {
    type: "event_participation",
    label: "Event Participation",
    description: "Verified participation in an approved event.",
    defaultPoints: 1,
    direction: "award",
    adminSelectable: true,
    bulkSelectable: true,
  },
  {
    type: "industry_applied",
    label: "Industry Visit Applied",
    description: "Applied before the visit deadline.",
    defaultPoints: 3,
    direction: "award",
    adminSelectable: true,
    bulkSelectable: true,
  },
  {
    type: "industry_offered",
    label: "Industry Visit Selected",
    description: "Selected by the company or organizing team.",
    defaultPoints: 4,
    direction: "award",
    adminSelectable: true,
    bulkSelectable: true,
  },
  {
    type: "cie_bonus",
    label: "CIE Attendance Bonus",
    description: "Approved CIE attendance bonus.",
    defaultPoints: 10,
    direction: "award",
    adminSelectable: true,
    bulkSelectable: true,
  },
];

export const ADMIN_POINT_RULES = POINT_RULES.filter((rule) => rule.adminSelectable);
export const BULK_POINT_RULES = POINT_RULES.filter((rule) => rule.bulkSelectable);

export function getPointRule(type: string): PointRule | undefined {
  return POINT_RULES.find((rule) => rule.type === type);
}

export function formatPointType(type: string) {
  return getPointRule(type)?.label ?? type.replace(/_/g, " ");
}
