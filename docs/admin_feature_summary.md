# Admin Feature Summary

This document summarizes the admin-side features implemented for the Culling Game LMS app.

## Admin Dashboard

- Shows active member count, danger zone count, attendance rate, open appeals, and the current admin-set semester.
- Displays at-risk students using active points.
- Shows pending point appeals and pending registration requests.
- Builds a live activity feed from recent confirmed point logs and new student registrations.

## Member Management

- Admins can view, search, and filter student/member records.
- Main member ordering uses active points, not lifetime points.
- Danger zone is based on active points below the configured threshold.
- Admins can warn students, move them to danger zone, update role/status/domain badge, and remove members.
- Removed members are excluded from normal active lists and rankings.

## Points System

- The app now separates two point systems:
  - Active points: stored in `users.redeemable_pts`; used for main ranking, danger zone, Century status, tickets, analytics, and semester performance.
  - Lifetime points: stored in `users.lifetime_pts`; cumulative across all participation and reserved for BOS / graduation-level ranking.
- Point awards and deductions are written to `point_logs` as the audit ledger.
- Confirmed point logs update active points, lifetime points, semester stats, status, and activity timestamps through database triggers.
- Point log embeds now use explicit foreign key relationships to avoid Supabase errors when joining `point_logs` and `users`.

## Attendance

- Admins can mark attendance per meeting.
- Attendance rows are locked after saving, preventing accidental rewrites.
- Attendance awards active and lifetime points through confirmed point logs.
- Skip-token attendance is supported and consumes available skip tokens.
- Meeting present counts are refreshed after attendance updates.

## CIE Bonus

- Admins can award CIE bonus points to eligible students.
- CIE bonus awarding is linked to meeting cooldown rules to prevent duplicate or rapid repeated awards.
- Confirmed CIE bonus logs participate in the unified active/lifetime point flow.

## Semester / Quarter Management

- Quarters represent semesters and are configured by admins.
- Only one active/current semester is allowed at a time.
- Admins can create, edit, set active/current, archive, and end semesters.
- Ending a semester:
  - recalculates final tiers,
  - archives/deactivates the completed semester,
  - resets active points to `0`,
  - resets semester points and grace usage,
  - keeps lifetime points untouched.
- Row-level security policies were added for `quarters`, fixing admin quarter creation failures.

## Tickets

- Ticket types are stored in `ticket_types` and can be configured by the nodal officer only.
- Golden Ticket:
  - costs `100` active points,
  - lets a student propose a new semester rule,
  - requires nodal officer approval or 25% voting-right support,
  - creates a pending review ticket purchase.
- Silver Ticket:
  - costs `60` active points,
  - acts as an event ticket,
  - is issued directly after purchase.
- Students can buy tickets using active points before semester reset.
- Ticket purchases create confirmed point spend logs with no lifetime point deduction.
- A student can buy only one ticket of the same type per semester unless the purchase is voided.

## Leaderboards

- Removed all-time, quarter, monthly, and separate rising rankings from the main leaderboard model.
- Main ranking uses active points.
- BOS ranking uses lifetime points.
- Main ranking includes a fast-rising indication for students who gained points recently.
- Century count and ranking logic use active points where operationally relevant.

## Analytics

- Analytics now use active points for operational averages and comparisons.
- BOS analytics still use lifetime points for best outgoing student candidates.
- Branch, cohort, tier, attendance, engagement, and BOS summaries are returned from live database data instead of hard-coded ranking assumptions.

## Projects

- Project update approvals create confirmed point logs.
- Funding claim approvals create confirmed point logs.
- Project point awards now rely on the unified point-log trigger instead of separately mutating user balances.

## Security And Data Consistency

- Added explicit RLS policies for semester/quarter operations.
- Added ticket RLS:
  - everyone can read ticket type definitions,
  - only nodal officers can modify ticket rules,
  - students can create their own ticket purchases,
  - admins and nodal officers can review purchases.
- Added clear database functions for:
  - current semester lookup,
  - confirmed point application,
  - Century activation using active points,
  - ticket purchase spending,
  - active-point-based tier recalculation.
- Recreated leaderboard and danger-zone views to match the unified schema.

