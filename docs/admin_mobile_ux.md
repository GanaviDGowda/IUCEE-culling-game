# ADMIN MOBILE UX ARCHITECTURE

## ROOT NAVIGATION (Bottom Nav)
- Home
- Members
- Points
- Events
- More

---

# HOME

## Sections
- Alerts
- Quick Actions
- Pending Actions
- Activity Feed
- Metrics

## Quick Actions
- Mark Attendance
- Award Points
- Create Meeting
- Broadcast Alert

---

# MEMBERS

## Tabs
- All Members
- Danger Zone
- Roles & Permissions

## All Members
- Search + Filters (Branch, Year, Tier, Status)
- Member Cards
  - Inline: Award · Warn · View

## Member Detail `/members/[id]`
### Tabs
- Profile · Points · Attendance · Projects · Mentorships · Warnings

### Actions (Bottom Sheet)
- Award Points
- Issue Warning
- Change Role
- Remove Member

---

## Danger Zone
- Critical Members
- Recovery Tracking
- Warning Queue
- Inline: Warn · Recovery Plan · Remove

---

## Roles & Permissions
- Admin Roles
- Nodal Officers
- Actions: Assign Role · Remove Role

---

# POINTS

## Tabs
- Award
- Attendance
- Logs
- Appeals

## Award
- Manual Award · Deduction · Bulk Award
- FAB → Bottom Sheet: User · Activity · Points · Note · Confirm

## Attendance
- Active Meeting · Bulk Check-In · Override · CIE Bonus
- Inline: Mark Present · Remove

## Logs
- Point History · Filters · Export

## Appeals
- Pending · Approved · Rejected
- Inline: Approve · Reject

---

# EVENTS

## Tabs
- Meetings
- Activities
- Calendar

## Meetings
- Create Meeting · Attendance Session · Agenda · Minutes
- FAB: Create Meeting
- Route: `/events/[meetingId]`

## Activities
- Create Activity · Registrations · Participation · Industry Visits
- Inline: Edit · Close Registration · Broadcast

## Calendar
- Monthly · Weekly · Timeline

---

# MORE

## Sections
- Projects
- Communication
- Leaderboards
- Analytics
- System

---

# PROJECTS

## Tabs
- Active Projects
- Weekly Updates
- Funding Claims

## Active Projects
- Registry · Team Members · Status
- Route: `/projects/[id]`
- Inline: View · Edit

## Weekly Updates
- Submitted · Missing · Dormant
- Inline: Approve · Reject

## Funding Claims
- Claims · Awarded Projects

---

# COMMUNICATION

## Tabs
- Notifications

---

# LEADERBOARDS

## Tabs
- Main Rankings
- Domain Rankings
- Tier Distribution

## Main Rankings
- Quarterly · Monthly · All Time · Rising

## Domain Rankings
- Tech · Innovation · Projects · Leadership · Creative

## Tier Distribution
- Tier Analytics · Branch · Year · Century Users

---

# ANALYTICS

## Tabs
- Engagement
- Attendance
- Branch & Year
- BOS Rankings

## Engagement
- Participation Trends · Retention · Point Velocity

## Attendance
- Trends · Consistency · Inactive Members

## Branch & Year
- Branch Performance · Year Performance · Cohort Comparison

## BOS Rankings
- Lifetime · Mentorship Score · Leadership Score

---

# SYSTEM

## Tabs
- Rules
- Quarter
- Holidays
- Tiers
- Atmosphere

## Rules
- Point · Tier · Streak · Century

## Quarter
- Dates · Evaluation Cycle · Archive

## Holidays
- Skip-Safe Days · Attendance Overrides

## Tiers
- Thresholds · Badges · Privileges

## Atmosphere
- Particle Density · Motion · Aura · Cinematic Effects

---

# DOMAIN SYSTEM

## Domains
| Domain | Covers | Badge |
|--------|--------|-------|
| Tech | Workshops, tool training, technical sessions | Tech Architect |
| Innovation | Competitions, mini events | Innovator |
| Projects | All projects | Builder |
| Leadership | Mentorship, team building | Strategist |
| Creative | Cultural events, media, design | Creator |

## Assignment
- Main Domain — highest contribution area
- Secondary Domain — second highest

## Profile Shows
Tier · Main Domain · Secondary Domain · Rank · Streak · Badge · Title

---

# UX PATTERNS

## Navigation
- Bottom Nav · Top Tabs · Stacked Routes

## Interaction
- Bottom Sheets · FABs · Inline Actions · Overflow Menus

## Layout
- Mobile-First · Swipeable Tabs · Sticky Headers · Contextual Actions