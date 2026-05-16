# CULLING GAME — AGENT IMPLEMENTATION REFERENCE
> Culling Game: Chapter Engagement & Gamification Platform  
> IUCEE EWB Student Chapter | FSD v1.0 + Design System (KOGANE PROTOCOL)  
> Status: Draft for Review | June 2026

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend / DB | Next.js + Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Hosting | Vercel |
| Storage | Supabase Storage (proof uploads) |
| PDF Export | React-PDF or pdfmake |
| Calendar Sync | Google Calendar API / .ics export |

---

## DESIGN SYSTEM — KOGANE PROTOCOL

### Theme Identity
The app must feel like **a cursed colony management system from Jujutsu Kaisen**.  
NOT: SaaS dashboard / gaming site / cyberpunk panel / anime fan UI.

### Color Tokens

```css
/* Core Palette */
--color-void:        #050505;   /* main background */
--color-charcoal:    #0B0B0F;   /* panels */
--color-blood:       #8B0000;   /* primary accent */
--color-crimson:     #DC2626;   /* highlights / danger */
--color-deep-red:    #450A0A;   /* overlays */
--color-text:        #E5E7EB;   /* primary text */
--color-muted:       #6B7280;   /* secondary text */

/* Status */
--status-danger:     crimson;
--status-stable:     #8B0000;
--status-century:    gold-red aura;
--status-removed:    dark desaturated red;
--status-elite:      sharp bright crimson;
```

**Glow rules:** Always soft atmospheric / blurred red bloom / low opacity aura. NEVER bright neon / pure #ff0000 / oversaturated.

### Typography

```
Headings:  Space Grotesk — uppercase, letter-spaced, medium weight
Stats/Numbers: JetBrains Mono — points, timers, rankings, energy values, logs
```

Heading examples: `COLONY STATUS` / `CURSED ENERGY` / `DANGER ZONE`

### Panel / Surface

```css
background: rgba(10,10,10,0.45);
backdrop-filter: blur(14px);
border: 1px solid rgba(255,0,0,0.15);
/* Use segmented/incomplete corners — NOT rounded SaaS cards */
```

Panel layers (bottom → top): Base (translucent black) → Grid (barrier texture) → Glow (faint red bloom) → Noise (hologram distortion) → Content

### Atmosphere Engine (Phase 1 Priority)

**Background layers:**
1. Void gradient: black → deep charcoal → dark red edges
2. Barrier grid: animated hex lines, 5–10% opacity, slow pulse, scan wave every 8–12s
3. Particles: ash (slow/gray-red/ambient), ember (upward drift/red/blurred), sparks (rare fast streaks)
4. Fog overlay: very subtle red mist / blurred aura

**Particle rules:** Drift naturally. Never bounce. Never playful. Motion ref: *smoke underwater*.

### Animation Philosophy

Always: slow pulses / float motion / energy waves / opacity shifts  
Never: bouncy / cartoon / fast twitchy

Kogane message animation: `opacity fade → vertical slide → glitch flicker`

### Cursed Energy Meter

DO NOT use standard progress bars.  
Use **circular cursed seal**: rotating outer ring + energy arc + pulsing center value + floating particles.

| Energy Level | Behavior |
|---|---|
| Low | unstable flicker |
| Medium | slow pulse |
| High | stronger aura |
| Century Ready (≥100) | intense rotation + overflow + expanded aura + aggressive pulse |

### Tier Badge Colors

| Tier | Color |
|---|---|
| Active (T0) | Gray |
| Contributor (T1) | Blue |
| Elite (T2) | Purple |
| Domain Master (T3) | Gold |
| Century (T4) | Red (permanent cosmetic) |

---

## DATA MODEL

### `users`

```sql
id               UUID PRIMARY KEY
name             VARCHAR
email            VARCHAR UNIQUE
role             ENUM('student','conveyor','nodal_officer','admin')
redeemable_pts   INT DEFAULT 0
lifetime_pts     INT DEFAULT 0          -- NEVER decreases
tier             ENUM('active','contributor','elite','domain_master','century')
domain_badge     VARCHAR NULL           -- 'Web Dev', 'AI/ML', 'Design', etc.
century_activated BOOLEAN DEFAULT false
warnings         INT DEFAULT 0
grace_used       BOOLEAN DEFAULT false  -- resets each academic year
referral_code    VARCHAR UNIQUE
referred_by      UUID FK NULL
status           ENUM('active','danger_zone','removed') DEFAULT 'active'
created_at       TIMESTAMP
last_active      TIMESTAMP
```

### `point_logs`

```sql
id           UUID PRIMARY KEY
user_id      UUID FK → users.id
type         ENUM('attendance','presentation','project_update','project_funded',
             'event_1st','event_2nd','event_special','event_participation',
             'industry_offered','industry_applied','cie_bonus','streak_bonus',
             'mentor_bonus','referral_bonus','century_spend','deduction','manual_award')
points       INT   -- positive = earn, negative = deduct/spend
awarded_by   UUID FK → users.id (admin)
note         TEXT NULL
status       ENUM('pending','confirmed','rejected')
meeting_id   UUID FK NULL → meetings.id
event_id     UUID FK NULL → events.id
created_at   TIMESTAMP
```

### `meetings`

```sql
id           UUID PRIMARY KEY
title        VARCHAR
date         DATE
time         TIME
location     VARCHAR
agenda       TEXT NULL
minutes      TEXT NULL
created_by   UUID FK
created_at   TIMESTAMP
```

### `events`

```sql
id                UUID PRIMARY KEY
name              VARCHAR
type              ENUM('hackathon','cultural','nss','industry_visit','other')
pts_1st           INT NULL
pts_2nd           INT NULL
pts_special       INT NULL
pts_participation INT NULL
pts_offered       INT NULL    -- industry visit: company-offered
pts_applied       INT NULL    -- industry visit: student-applied
apply_deadline    TIMESTAMP NULL
proof_required    BOOLEAN DEFAULT true
created_by        UUID FK
created_at        TIMESTAMP
```

### `projects`

```sql
id                   UUID PRIMARY KEY
name                 VARCHAR
description          TEXT
owner_id             UUID FK
collaborators        UUID[]
funded               BOOLEAN DEFAULT false
funded_pts_claimed   BOOLEAN DEFAULT false   -- prevent double-claim
created_at           TIMESTAMP
```

### `announcements`

```sql
id          UUID PRIMARY KEY
title       VARCHAR
body        TEXT   -- rich text
tag         ENUM('general','urgent','event','info')
pinned      BOOLEAN DEFAULT false
author_id   UUID FK
created_at  TIMESTAMP
```

### `grace_periods`

```sql
id                     UUID PRIMARY KEY
user_id                UUID FK
quarter                VARCHAR   -- e.g. '2026-Q1'
reason                 TEXT
requested_at           TIMESTAMP
nodal_recommended_by   UUID FK NULL
admin_approved_by      UUID FK NULL
status                 ENUM('pending','approved','rejected')
```

### `mentorships`

```sql
id          UUID PRIMARY KEY
mentor_id   UUID FK   -- must be Tier 2+
mentee_id   UUID FK   -- must be Tier 0 or Tier 1
started_at  TIMESTAMP
ended_at    TIMESTAMP NULL
active      BOOLEAN DEFAULT true
```

---

## POINT SYSTEM

### Dual-Track Architecture

| Track | Can Decrease? | Used For |
|---|---|---|
| `redeemable_pts` | Yes (spending / Century) | Tier calc, danger zone, Century trigger |
| `lifetime_pts` | Never | Best Outgoing Student, badges, alumni |

### Earning Events

| Activity | Points | Requires Confirmation |
|---|---|---|
| Weekly meeting attendance | +1 | Admin or Conveyor |
| Presentation / tech share | +2 | Admin (Conveyor flags → pending) |
| Project weekly update | +1/week | Admin (Conveyor flags → pending) |
| Project receives external funding | +5 (one-time) | Admin + proof (within 7 days) |
| Hackathon 1st place | +5 | Admin + proof upload |
| Hackathon 2nd place | +4 | Admin + proof upload |
| Hackathon special mention | +3 | Admin + proof upload |
| Competition / Hackathon participation | +2 | Admin + proof upload |
| Industry Visit — offered by company | +4 | Admin (set when publishing) |
| Industry Visit — applied by student | +3 | Admin confirms |
| CIE Bonus (all present, once/month) | +1 | Admin one-click bulk (system-locked after use) |
| Streak bonus (4 consecutive meetings, no skip) | +1 | System auto |
| Mentor bonus (mentee earns 5+ pts in month) | +1/month | System auto |
| Referral (referred member completes 1 full quarter) | +3 | System auto |

### Spending Events

| Action | Cost | Effect | Restriction |
|---|---|---|---|
| Use 1 meeting free skip | 0 pts (token) | Miss meeting, no point loss | Max 1/month (T1), max 2/month (T2+) |
| Activate Century privilege | -100 redeemable | AM-level priority, veto rights 1 quarter | Only when balance ≥ 100. Surplus also lost (resets to 0). |

### Skip Token Rules
- Token awarded when member earns 5 pts in a calendar month (auto)
- T1 max: 1 token/month (extras discarded)
- T2+ max: 2 tokens/month
- Using skip = no streak reset for meeting absence
- BUT using a skip DOES reset the streak counter (bonus requires no-skip consecutive run)
- Official college holidays do NOT consume a token (admin configures)

### Streak System
- Counter increments on consecutive weekly meeting attendance
- At 4th consecutive attendance (no skip) → auto +1 bonus
- Counter resets to 0 on any missed meeting (skip or absence)
- Displayed as flame icon on dashboard and leaderboard

---

## PRIVILEGE TIERS

Tiers calculated quarterly on `redeemable_pts`. Auto-update at quarter end.

| Tier | Name | Quarterly Pts |
|---|---|---|
| T0 | Active | 0–14 |
| T1 | Contributor | 15–29 |
| T2 | Elite | 30–59 |
| T3 | Domain Master | 60–99 |
| T4 | Century | Spend 100 pts |

### T0 — Active
- Standard participation rights
- < 15 pts → Danger Zone warning
- < 6 pts end of quarter → removal workflow (no appeal)

### T1 — Contributor
- 5 pts earned in any calendar month → 1 free skip
- Can nominate agenda topics (submit before meeting day)
- Can vote on chapter polls
- "Contributor" badge on leaderboard / profile

### T2 — Elite
- 2 free skips/month
- Exclusive access to advanced workshops
- Can register as mentor to 1 junior (T0 or T1)
- Mentee earns 5+ pts in month → mentor gets +1 (max once/month)
- Name **bold** on leaderboard

### T3 — Domain Master
- Propose and lead sub-events independently (schedule needs admin)
- Priority presentation slot in meetings
- Vote weight 2x on activity selection
- Domain badge on profile

### T4 — Century (deliberate, irreversible)
Privileges (valid 1 quarter after activation):
- Priority word in all meetings / event planning at AM level
- Veto 1 admin decision/quarter (removal decisions excluded — system-blocked)
- Priority for external industry visits / conferences
- Bypass approval for pitching funded projects to admin
- Permanent cosmetic "Century" badge (never removed)
- Alumni acknowledgment at graduation (if lifetime pts qualify)

Post-activation:
- `redeemable_pts` resets to 0 immediately
- Any surplus above 100 is also lost
- Next calendar month: minimum threshold raises to 30 pts (system auto-sets per user)

**UX requirement:** "Spend 100 Points" button must show confirmation modal with: points deducted, privileges granted, score reset warning, raised minimum. Two-step confirm: "I Understand" checkbox → "Activate Century" button. No undo.

---

## BUSINESS RULES

### Attendance
1. Can only mark attendance for meetings with a record in `meetings` table
2. Bulk mark → one `point_logs` per member, `status = confirmed`
3. A member cannot be marked present for the same meeting twice
4. Attendance marked after 7 days requires admin note

### Presentation / Project Updates
5. Conveyor flags → `point_logs` created with `status = pending`
6. Admin confirms or rejects
7. Max 1 presentation (+2 pts) per member per meeting
8. Max 1 project update (+1 pt) per project per meeting
9. Active project with 2 consecutive weeks no update → system reminder to admin

### CIE Bonus
10. Admin can apply CIE Bonus only once per calendar month
11. Button locks until 1st of next month after use
12. Applies to all members marked present in most recent meeting of that month
13. Absent members do not receive it

### Century Activation
14. Available only when `redeemable_pts ≥ 100`
15. Deducts exactly 100. Any surplus is lost (balance → 0)
16. Privileges valid for current + immediately following calendar month
17. Next month minimum raises to 30 pts (system auto-sets for that user)
18. Century badge is permanent, cosmetic, never removed
19. Veto on removal decisions → system blocks with explanatory message

### Removal
20. Triggered when student ends quarter with < 6 pts. Not automatic — admin must confirm.
21. Irreversible except via re-instatement panel (exceptional cases only)
22. Re-instatement: written justification + Nodal Officer endorsement + admin finalisation
23. Removed member's point history archived (not deleted) for audit

### Grace Period
- 1 academic grace quarter per year (medical / genuine emergency)
- Points count toward tier; danger zone removal suspended for that quarter
- Must be requested before event or within 3 calendar days after
- Nodal Officer recommends → Admin finalises. Approval logged with reason.
- Does not carry over if unused

### Year-End Decay
- `redeemable_pts` above 80 do NOT carry forward across academic years
- At year-end: if balance > 80, resets to 50
- `lifetime_pts` unaffected
- Century badge and tier history remain permanently

### Tier Calculation
24. Based on `redeemable_pts` earned in current quarter only (not lifetime)
25. Updates applied automatically at start of next quarter
26. Domain badge (T3) set manually by admin
27. Leaderboard always shows current quarter tier

### Nodal Officer Accountability
- Minimum: 2 meetings/quarter
- 1st miss → written warning
- 2nd miss → escalation alert on all dashboards + student-initiated replacement vote triggered

---

## ROLE ACCESS MATRIX

| Feature | Student | Conveyor | Nodal/Coord | Admin |
|---|---|---|---|---|
| View own points + tier | ✓ | ✓ | ✓ | ✓ |
| View leaderboard | ✓ | ✓ | ✓ | ✓ |
| View calendar | ✓ | ✓ | ✓ | ✓ |
| View announcements | ✓ | ✓ | ✓ | ✓ |
| Submit project updates | ✓ | ✓ | — | — |
| Request presentation slot | ✓ | ✓ | — | — |
| Post announcements | — | ✓ | ✓ | ✓ |
| Schedule meetings / events | — | ✓ | ✓ | ✓ |
| Flag presentation / update (pending) | — | ✓ | — | — |
| Mark attendance (bulk) | — | — | — | ✓ |
| Award / deduct points | — | — | — | ✓ |
| Confirm flagged points | — | — | — | ✓ |
| Apply CIE bonus | — | — | — | ✓ (once/month lock) |
| Issue warnings | — | — | — | ✓ |
| Remove members | — | — | — | ✓ |
| Approve grace periods | — | — | Recommend | ✓ (finalise) |
| Configure system settings | — | — | — | ✓ |
| Export CSV/PDF reports | — | — | Read-only | ✓ |
| View nodal officer strikes | — | — | Own only | ✓ |

---

## FEATURE SPECIFICATIONS

### Admin Dashboard

**Attendance & Points:**
- Bulk attendance: select meeting date → tick members → submit → auto +1 each
- Individual point award: member selector → activity type → optional note → submit
- Point deduction: mandatory reason log (auditable)
- Event points: set competition place → system auto-calculates
- Project update confirm: approve/reject Conveyor-flagged records (each approval → +1)
- CIE Bonus: one-click bulk +1 to all present. Locks for rest of month.
- Appeal review panel: view/approve/reject student deduction contests

**Member Management:**
- Roster: sortable by name, role, tier, total pts, quarterly pts, meetings attended, streak, last activity
- Danger zone panel: auto-populated with members < 15 pts current quarter. Shows days remaining.
- Removal workflow: two-step confirm + reason log + audit trail
- Re-instatement request panel: requires written justification + Nodal Officer sign-off
- Export: full member report as CSV or PDF including point history

**Announcements & Scheduling:**
- Post: title, body (rich text), optional link, tag (Urgent/Event/Info/General), pin toggle
- Schedule meetings: date, time, location, agenda
- Set events: type, max points, registration deadline, link
- Industry visit: set "Apply by" deadline. Applied before deadline = 3 pts; company-selected = admin upgrades to 4 pts
- Notifications: send in-app to all or filtered by tier/role

**System Settings:**
- Configure quarterly evaluation start/end dates
- Override default point values per event
- Manage role assignments (Conveyor, Nodal Officer)
- Configure skip-holiday rules (mark official holidays)
- Archive completed quarters (read-only, restorable for audit)

### Nodal Officer Portal
- Post announcements
- Schedule activities on shared calendar
- View attendance (read-only)
- Recommend point bonuses to admin (admin must confirm)
- View danger zone list (members < 15 pts current quarter)
- Request admin to organise industry visits
- Personal accountability tracker: meetings/quarter progress, redeemable + lifetime balance, warning status (0/1st Strike/2nd Strike)
- 2nd strike: permanent dashboard banner, student replacement vote triggered
- Monthly activity summary auto-submitted to admin

### Conveyor Interface
- Post weekly meeting summaries/minutes (pinned on home feed)
- Schedule meetings with agenda + expected speakers
- Flag members who gave presentations → pending +2 request to admin
- Log project updates given in meeting → pending +1 per student request to admin
- Collaborative agendas: T1+ members submit agenda items before meeting day; Conveyor approves/rejects

### Student Portal

**Home Dashboard:**
- Current redeemable pts + tier badge + animated progress bar to next tier
- Points earned this month vs monthly minimum
- Quarterly status: On Track / Approaching Danger Zone / Danger Zone
- Free skips remaining (token icons)
- Century progress bar (0→100)
- Upcoming meetings and events (next 3 from calendar)
- Latest pinned announcements
- Streak flame counter

**Points & History:**
- Full point log: date, activity type, points, awarded by, optional note
- Quarterly breakdown bar chart (one bar per month)
- Badge collection panel
- "Spend 100 Points" button with full consequence confirmation dialog
- Point appeal form (visible in admin panel)

**Projects:**
- Register: name, description, team members (tag by username), GitHub/link
- Submit weekly update before meeting: text + optional screenshot → pending +1
- Update log: timestamps + approval status
- Funding notification: student reports → admin verifies → +5
- Collaborator invite: tag teammates, shared project page

**Events & Activities:**
- Browse open events: hackathons, NSS, industry visits — point value, deadline, description
- Apply within deadline (creates record for admin verification)
- Participation history with points received
- Upload proof: certificate/screenshot/photo — admin verifies within 7 days. No proof = no points.
- "I want to present" slot request → Conveyor reviews

---

## SHARED FEATURES

### Calendar
- Monthly and weekly view
- Color coding: Meeting (teal), Hackathon (purple), Cultural (orange), NSS/Visit (blue), Deadline (red)
- Event detail on click: point value, deadline, eligibility, location
- Google Calendar sync + iCal export
- RSVP toggle (visible to admin)
- Countdown timer on home feed for next meeting

### Leaderboard
- Default: current quarter ranking
- Filter tabs: This Month / This Quarter / All Time
- Top 3: podium styling + rank icons + aura glow (red aura / special borders / ambient particles for Century users)
- Personal rank pinned at bottom (regardless of scroll position)
- "Rising" tag: top 3 fastest point gainers this week
- Tier badges next to each name
- Streak flame icon for 4+ consecutive streak
- T2+ names in bold
- Domain sub-leaderboards: Top Presenter / Top Hackathon Performer / Top Project Contributor
- Rank change animations: upward movement + glow pulse + score increment effect

### Notification Triggers

| Event | Recipient | Channel |
|---|---|---|
| Meeting scheduled/updated | All members | In-app |
| Points awarded | Individual | In-app |
| Danger zone crossed | Individual + Admin | In-app + banner |
| Removal decision | Removed + Admin | In-app |
| New announcement (Urgent) | All | In-app push |
| New announcement (other) | All | In-app |
| Grace period approved | Individual + Admin | In-app |
| Streak bonus earned | Individual | In-app |
| Century activated | All members (public event) | In-app |
| Event deadline approaching (48h) | All who applied | In-app |
| Nodal Officer strike issued | Nodal Officer + Admin | In-app |
| 2nd Nodal Officer strike | All members + Admin | In-app (vote triggered) |
| Best Outgoing Student nominated | Nominated + Admin | In-app |

---

## CRITICAL UX FLOWS

### Check-In Flow
1. Member opens app on meeting day
2. Home screen shows "Weekly Meeting — Today" check-in banner
3. Tap "Check In" → attendance recorded → banner → "✓ Checked In — +1 point awarded"
4. Admin can override/revoke within 24 hours

### Century Activation Flow
1. Member reaches 100 pts → "Spend 100 Points" button activates (gold, animated)
2. Tap → modal: points deducted (100), privileges unlocked, score reset warning, raised minimum next month
3. Two-step confirm: "I Understand" checkbox → "Activate Century" button
4. On confirm: score → 0, Century badge appears permanently, privileges activate
5. Toast notification to all: "[Name] has activated Century status."

**Century Activation Sequence (UI atmosphere):**
1. UI darkens
2. Barrier expands
3. Particles intensify
4. Seal rotates rapidly
5. Display: `100 POINTS SACRIFICED`
6. Display: `AWAKENING COMPLETE`
7. All UI returns with enhanced aura + Century badge + altered atmosphere

### Danger Zone Flow
1. System checks quarterly pts each week-end
2. Member drops below 15 → Danger Zone banner on their home screen
3. Admin notified → member appears in danger zone panel
4. Admin actions: issue warning / create action plan note / begin removal workflow
5. End of quarter < 6 pts → removal confirmation workflow triggers

**Danger Zone UI:**
- Background darker
- Particles more aggressive
- UI glow unstable
- Grid stronger distortion
- Persistent alerts
- Large centered banner: `DANGER ZONE / POINT THRESHOLD CRITICAL`

### Kogane System Notifications
Messages appear: sudden / cold / authoritative  
Format: `RULE UPDATED` / `PLAYER DETECTED` / `POINT DEDUCTION CONFIRMED`  
Panel: floating circular icon + holographic projection + vertical reveal motion

---

## BEST OUTGOING STUDENT AWARD

### Eligibility
- Active member for minimum 3 semesters
- Never removed from chapter
- Tier 1+ standing in final active quarter

### Selection Criteria

| Criterion | Weight |
|---|---|
| Lifetime Status Points | 60% |
| Mentorship contributions (mentees → T1+) | 15% |
| Leadership roles (Conveyor, sub-event leads) | 15% |
| Century badge earned (any point in tenure) | 10% |

### Award Components
- Physical trophy / certificate at annual graduation
- Officially stamped Letter of Recommendation (co-signed by Nodal Officer)
- Letter states: chapter rank, lifetime points, leadership roles, domain expertise
- Permanent "Best Outgoing Student" badge on archived profile
- Alumni acknowledgment page entry (public-facing site)

---

## IMPLEMENTATION ROADMAP

### Phase 1 — Core MVP (Weeks 1–4)
- [ ] Auth (email/password login, role assignment)
- [ ] Point award, attendance marking, basic leaderboard
- [ ] Member dashboard: total pts, tier badge, activity log
- [ ] Admin panel: award points, view roster, danger zone list
- [ ] Basic announcements (post, view, pin)
- [ ] **Atmosphere engine: particles, barrier grid, fog, glow** ← Design System Priority

### Phase 2 — Calendar & Engagement (Weeks 5–8)
- [ ] Shared interactive calendar with event types + color coding
- [ ] Meeting check-in flow
- [ ] Event registration + proof-of-participation upload
- [ ] Streak tracking + streak bonus auto-award
- [ ] In-app announcement notifications
- [ ] My Stats screen: KPIs, bar charts, radar chart, monthly history
- [ ] Core UI system: cards, buttons, Kogane, typography

### Phase 3 — Advanced Features (Weeks 9–14)
- [ ] Project module (register, weekly updates, funding claim)
- [ ] Mentorship system
- [ ] Point appeal form + admin review panel
- [ ] Grace period workflow
- [ ] Century activation with full confirmation + atmospheric sequence
- [ ] Referral system
- [ ] Export reports (CSV / PDF)
- [ ] Google Calendar / iCal sync
- [ ] Cursed energy meter + seals + Century effects

### Phase 4 — Polish & Year-End (Weeks 15–18)
- [ ] Year-end decay system + quarter archival
- [ ] Best Outgoing Student automated ranking + report generation
- [ ] Domain sub-leaderboards
- [ ] Badge collection system
- [ ] Full accessibility audit + mobile polish
- [ ] Admin configuration panel (event point overrides, skip holiday rules, role management)

---

## BADGE CATALOGUE

| Badge | Trigger | Type |
|---|---|---|
| First Step | Earn first point | Milestone |
| Streak Starter | First 4-meeting streak | Streak |
| Streak Master | 8-meeting streak, no skip | Streak |
| Speaker | First presentation | Milestone |
| Regular | Attend 10 meetings total | Milestone |
| Hackathon Hero | 1st place in any hackathon | Achievement |
| Builder | 4 consecutive project updates | Project |
| Funded! | Project receives external funding | Project |
| Mentor | Active mentorship 1+ month | Social |
| Contributor | Reach Tier 1 first time | Tier |
| Elite | Reach Tier 2 first time | Tier |
| Domain Master | Reach Tier 3 first time | Tier |
| Centurion | Activate Century status (permanent) | Tier |
| Best Outgoing Student | Highest lifetime pts at graduation | Award |

---

## ACCESSIBILITY REQUIREMENTS

- Minimum contrast ratio 4.5:1 for all body text on dark backgrounds
- All interactive elements minimum 44×44 px tap target
- Form inputs: descriptive labels (no placeholder-only inputs)
- All charts / graphs include text summary alternative

---

## NAVIGATION STRUCTURE

| Screen | Access | Nav Label |
|---|---|---|
| Home / Dashboard | All roles | Home |
| Calendar | All roles | Calendar |
| Announcements | All roles | Updates |
| Leaderboard | All roles | Board |
| My Stats | All roles | My Stats |
| Rules | All roles | Rules |
| Admin Panel | Admin, Nodal Officer | Admin |

---

*End of Agent Reference Document — Culling Game FSD v1.0 + KOGANE PROTOCOL*
