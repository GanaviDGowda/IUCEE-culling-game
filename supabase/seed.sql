-- Demo data only. Requires demo Auth users first (Edge Function seed-demo).
-- Local: npm run db:seed   (or npm run db:reset after migrations).
-- Hosted: deploy seed-demo, POST .../functions/v1/seed-demo with Bearer service_role, then run this file in SQL Editor.

BEGIN;

INSERT INTO quarters (id, label, start_date, end_date, is_current, is_archived) VALUES
  ('b0000000-0000-0000-0000-000000000001', '2025-Q3', '2025-07-01', '2025-09-30', false, true),
  ('b0000000-0000-0000-0000-000000000002', '2025-Q4', '2025-10-01', '2025-12-31', false, true),
  ('b0000000-0000-0000-0000-000000000003', '2026-Q1', '2026-01-01', '2026-03-31', false, true),
  ('b0000000-0000-0000-0000-000000000004', '2026-Q2', '2026-04-01', '2026-06-30', true,  false)
ON CONFLICT (label) DO NOTHING;

INSERT INTO meetings (id, title, date, time, location, agenda, minutes, is_holiday, created_by) VALUES
  ('d0000000-0000-0000-0000-000000000001',
   'Weekly Meeting #1', '2026-04-05', '10:00', 'Lab 3A',
   'Intro + Q2 kickoff + rule walkthrough',
   'Q2 kicked off. Rules explained. All members present.',
   false, 'c0000000-0000-0000-0000-000000000002'),

  ('d0000000-0000-0000-0000-000000000002',
   'Weekly Meeting #2', '2026-04-12', '10:00', 'Lab 3A',
   'Project pitches + attendance policy review',
   'Three project pitches presented. Attendance policy reinforced.',
   false, 'c0000000-0000-0000-0000-000000000002'),

  ('d0000000-0000-0000-0000-000000000003',
   'Weekly Meeting #3', '2026-04-19', '10:00', 'Lab 3A',
   'Industry visit briefing + hackathon announcement',
   'Industry visit slots opened. Hackathon announced for May.',
   false, 'c0000000-0000-0000-0000-000000000002'),

  ('d0000000-0000-0000-0000-000000000004',
   'Weekly Meeting #4', '2026-04-26', '10:00', 'Lab 3A',
   'Project updates + streak check',
   'Project updates reviewed. Streak bonuses awarded.',
   false, 'c0000000-0000-0000-0000-000000000002'),

  ('d0000000-0000-0000-0000-000000000005',
   'Weekly Meeting #5', '2026-05-03', '10:00', 'Lab 3A',
   'Mid-quarter review + danger zone warnings',
   'Mid-quarter standings shared. Warning letters issued.',
   false, 'c0000000-0000-0000-0000-000000000002'),

  ('d0000000-0000-0000-0000-000000000006',
   'Weekly Meeting #6', '2026-05-10', '10:00', 'Lab 3A',
   'Hackathon debrief + CIE bonus discussion',
   'Hackathon results discussed. CIE bonus applied.',
   false, 'c0000000-0000-0000-0000-000000000002'),

  ('d0000000-0000-0000-0000-000000000007',
   'Weekly Meeting #7', '2026-05-17', '10:00', 'Lab 3A',
   'Project showcase + Q2 projections',
   NULL, false,
   'c0000000-0000-0000-0000-000000000002')

ON CONFLICT (id) DO NOTHING;



INSERT INTO events (
  id, name, description, type,
  pts_1st, pts_2nd, pts_special, pts_participation, pts_offered, pts_applied,
  apply_deadline, proof_required, max_participants,
  event_date, location, external_link, created_by
) VALUES
  ('e0000000-0000-0000-0000-000000000001',
   'InnoHack 2026', 'Inter-college 24-hr hackathon', 'hackathon',
   10, 6, 4, 2, NULL, NULL,
   '2026-05-01 23:59:00+05:30', true, 30,
   '2026-05-03 09:00:00+05:30', 'Main Auditorium', 'https://innohack.dev',
   'c0000000-0000-0000-0000-000000000003'),

  ('e0000000-0000-0000-0000-000000000002',
   'TechVista Industry Visit', 'Visit to TechVista Bengaluru campus', 'industry_visit',
   NULL, NULL, NULL, NULL, 8, 4,
   '2026-04-20 23:59:00+05:30', true, 15,
   '2026-05-08 09:00:00+05:30', 'TechVista HQ, Bengaluru', NULL,
   'c0000000-0000-0000-0000-000000000003'),

  ('e0000000-0000-0000-0000-000000000003',
   'Cultural Fest — Code Talent Hunt', 'Coding round in Annual Cultural Fest', 'cultural',
   5, 3, 2, 1, NULL, NULL,
   '2026-06-01 23:59:00+05:30', true, 50,
   '2026-06-14 10:00:00+05:30', 'College Ground', NULL,
   'c0000000-0000-0000-0000-000000000004')

ON CONFLICT (id) DO NOTHING;



INSERT INTO projects (id, name, description, github_url, owner_id, funded, active) VALUES
  ('f0000000-0000-0000-0000-000000000001',
   'CampusConnect', 'Smart campus navigation & timetable app',
   'https://github.com/arjun/campusconnect',
   'c0000000-0000-0000-0000-000000000005', false, true),

  ('f0000000-0000-0000-0000-000000000002',
   'AgriSense', 'IoT soil-health monitoring for small farms',
   'https://github.com/kiran/agrisense',
   'c0000000-0000-0000-0000-000000000009', true, true),

  ('f0000000-0000-0000-0000-000000000003',
   'DesignKit', 'Open-source UI component library',
   'https://github.com/divya/designkit',
   'c0000000-0000-0000-0000-000000000010', false, true)

ON CONFLICT (id) DO NOTHING;


INSERT INTO project_collaborators (project_id, user_id) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006'),
  ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007'),
  ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004'),
  ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006')
ON CONFLICT DO NOTHING;


INSERT INTO attendance (meeting_id, user_id, marked_by, used_skip) VALUES
('d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000011','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000002',true),  -- skip used
('d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000011','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000002',false),
('d0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000011','c0000000-0000-0000-0000-000000000002',false)
ON CONFLICT (meeting_id, user_id) DO NOTHING;



INSERT INTO point_logs (user_id, type, points, status, awarded_by, meeting_id, note, quarter) VALUES
('c0000000-0000-0000-0000-000000000005','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000001','Meeting #1 attendance','2026-Q2'),
('c0000000-0000-0000-0000-000000000005','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000002','Meeting #2 attendance','2026-Q2'),
('c0000000-0000-0000-0000-000000000005','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000003','Meeting #3 attendance','2026-Q2'),
('c0000000-0000-0000-0000-000000000005','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000004','Meeting #4 attendance','2026-Q2'),
('c0000000-0000-0000-0000-000000000005','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000005','Meeting #5 attendance','2026-Q2'),
('c0000000-0000-0000-0000-000000000005','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000006','Meeting #6 attendance','2026-Q2'),
('c0000000-0000-0000-0000-000000000005','streak_bonus',1,'confirmed',NULL,'d0000000-0000-0000-0000-000000000004','Streak bonus: 4 consecutive meetings','2026-Q2'),
('c0000000-0000-0000-0000-000000000005','presentation',3,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000002','CampusConnect demo','2026-Q2'),
('c0000000-0000-0000-0000-000000000005','event_1st',10,'confirmed','c0000000-0000-0000-0000-000000000003',NULL,'InnoHack 2026 — 1st place','2026-Q2'),

('c0000000-0000-0000-0000-000000000006','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000001','Meeting #1 attendance','2026-Q2'),
('c0000000-0000-0000-0000-000000000006','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000002','Meeting #2 attendance','2026-Q2'),
('c0000000-0000-0000-0000-000000000006','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000003','Meeting #3 attendance','2026-Q2'),
('c0000000-0000-0000-0000-000000000006','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000004','Meeting #4 attendance','2026-Q2'),
('c0000000-0000-0000-0000-000000000006','streak_bonus',1,'confirmed',NULL,'d0000000-0000-0000-0000-000000000004','Streak bonus: 4 consecutive meetings','2026-Q2'),
('c0000000-0000-0000-0000-000000000006','referral_bonus',2,'confirmed',NULL,NULL,'Referred Arjun Sharma','2026-Q2'),
('c0000000-0000-0000-0000-000000000006','presentation',3,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000003','UI/UX presentation','2026-Q2'),

('c0000000-0000-0000-0000-000000000009','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000001','Meeting #1','2026-Q2'),
('c0000000-0000-0000-0000-000000000009','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000002','Meeting #2','2026-Q2'),
('c0000000-0000-0000-0000-000000000009','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000003','Meeting #3','2026-Q2'),
('c0000000-0000-0000-0000-000000000009','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000004','Meeting #4','2026-Q2'),
('c0000000-0000-0000-0000-000000000009','streak_bonus',1,'confirmed',NULL,NULL,'Streak bonus: 4 consecutive','2026-Q2'),
('c0000000-0000-0000-0000-000000000009','project_funded',15,'confirmed','c0000000-0000-0000-0000-000000000001',NULL,'AgriSense external funding','2026-Q2'),
('c0000000-0000-0000-0000-000000000009','industry_offered',8,'confirmed','c0000000-0000-0000-0000-000000000003',NULL,'TechVista — company offered','2026-Q2'),

('c0000000-0000-0000-0000-000000000007','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000001','Meeting #1','2026-Q2'),
('c0000000-0000-0000-0000-000000000007','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000002','Meeting #2','2026-Q2'),

('c0000000-0000-0000-0000-000000000008','attendance',2,'confirmed','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000001','Meeting #1','2026-Q2'),
('c0000000-0000-0000-0000-000000000008','deduction',-5,'confirmed','c0000000-0000-0000-0000-000000000001',NULL,'Misconduct deduction','2026-Q2'),

('c0000000-0000-0000-0000-000000000007','presentation',3,'pending','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000006','IoT project demo — pending review',NULL)
ON CONFLICT DO NOTHING;



INSERT INTO event_registrations (event_id, user_id, placement, proof_url, verified, verified_by, pts_awarded) VALUES
('e0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000005','1st','proof-uploads/innohack_arjun.pdf',true,'c0000000-0000-0000-0000-000000000003',10),
('e0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000009','participation','proof-uploads/innohack_kiran.pdf',true,'c0000000-0000-0000-0000-000000000003',2),
('e0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000009','offered','proof-uploads/techvista_kiran.pdf',true,'c0000000-0000-0000-0000-000000000003',8),
('e0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000006','applied','proof-uploads/techvista_priya.pdf',false,NULL,NULL)
ON CONFLICT (event_id, user_id) DO NOTHING;



INSERT INTO project_updates (project_id, user_id, meeting_id, content, status, reviewed_by) VALUES
('f0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000005','d0000000-0000-0000-0000-000000000002',
 'Completed navigation module. Map integration 80% done.','confirmed','c0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000005','d0000000-0000-0000-0000-000000000004',
 'Timetable sync feature shipped. Auth flow implemented.','confirmed','c0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000009','d0000000-0000-0000-0000-000000000003',
 'Sensor calibration done. Dashboard prototype live.','confirmed','c0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000010','d0000000-0000-0000-0000-000000000005',
 'Button and card components published to npm.','pending',NULL)
ON CONFLICT (project_id, meeting_id) DO NOTHING;



INSERT INTO announcements (title, body, tag, pinned, author_id) VALUES
('Q2 Has Officially Begun!',
 'Welcome to Quarter 2 of the Culling Game. Minimum 15 pts required to stay active. Danger zone kicks in below that threshold.',
 'general', true, 'c0000000-0000-0000-0000-000000000001'),
('InnoHack 2026 — Register Now',
 'Inter-college 24-hr hackathon on May 3rd. Top prize: 10 pts. Apply before May 1st via the Events tab.',
 'event', false, 'c0000000-0000-0000-0000-000000000003'),
('URGENT: Danger Zone Warning',
 'Members below 15 pts have received first warnings. Grace period applications open until end of quarter.',
 'urgent', true, 'c0000000-0000-0000-0000-000000000001'),
('TechVista Industry Visit Slots Open',
 'Limited seats for the TechVista visit on May 8th. Offered slots: +8 pts. Applied slots: +4 pts. Proof required.',
 'info', false, 'c0000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;



INSERT INTO mentorships (mentor_id, mentee_id, active, started_at) VALUES
('c0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000007', true,  '2026-04-05 10:00:00+05:30'),
('c0000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000010', true,  '2026-04-05 10:00:00+05:30'),
('c0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000012', true,  '2026-04-12 10:00:00+05:30')
ON CONFLICT DO NOTHING;



INSERT INTO grace_periods (user_id, quarter, reason, status, nodal_recommended_by) VALUES
('c0000000-0000-0000-0000-000000000008', '2026-Q2',
 'Medical emergency. Hospitalised for 3 weeks in April.',
 'pending', 'c0000000-0000-0000-0000-000000000004')
ON CONFLICT (user_id, quarter) DO NOTHING;



INSERT INTO skip_tokens (user_id, earned_at, expires_at, used, used_at, used_for_meeting) VALUES
('c0000000-0000-0000-0000-000000000005', '2026-04-01', '2026-04-30', true,  '2026-04-19', NULL),
('c0000000-0000-0000-0000-000000000005', '2026-05-01', '2026-05-31', false, NULL, NULL),
('c0000000-0000-0000-0000-000000000009', '2026-04-01', '2026-04-30', false, NULL, NULL),
('c0000000-0000-0000-0000-000000000009', '2026-05-01', '2026-05-31', false, NULL, NULL),
('c0000000-0000-0000-0000-000000000007', '2026-04-01', '2026-04-30', true, '2026-04-19',
 'd0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;



INSERT INTO user_badges (user_id, badge_id)
SELECT 'c0000000-0000-0000-0000-000000000005', id FROM badges WHERE slug = 'first_step'
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'c0000000-0000-0000-0000-000000000005', id FROM badges WHERE slug = 'streak_starter'
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'c0000000-0000-0000-0000-000000000005', id FROM badges WHERE slug = 'hackathon_hero'
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'c0000000-0000-0000-0000-000000000005', id FROM badges WHERE slug = 'speaker'
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'c0000000-0000-0000-0000-000000000005', id FROM badges WHERE slug = 'contributor'
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'c0000000-0000-0000-0000-000000000009', id FROM badges WHERE slug = 'funded'
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'c0000000-0000-0000-0000-000000000009', id FROM badges WHERE slug = 'domain_master'
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'c0000000-0000-0000-0000-000000000001', id FROM badges WHERE slug = 'centurion'
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'c0000000-0000-0000-0000-000000000006', id FROM badges WHERE slug = 'streak_starter'
ON CONFLICT DO NOTHING;



INSERT INTO notifications (user_id, type, title, body, ref_type, read) VALUES
('c0000000-0000-0000-0000-000000000008','danger_zone',
 '⚠️ Danger Zone Alert',
 'Your points have dropped below 15. Earn at least 7 more pts this quarter to avoid removal.',
 'point_log', false),

('c0000000-0000-0000-0000-000000000005','points_awarded',
 '🏆 InnoHack 2026 — 1st Place Confirmed',
 'Congratulations! +10 pts awarded for winning InnoHack 2026.',
 'point_log', true),

('c0000000-0000-0000-0000-000000000009','points_awarded',
 '💰 Project Funded — AgriSense',
 '+15 pts awarded. AgriSense has received external funding!',
 'point_log', true),

('c0000000-0000-0000-0000-000000000005','streak_bonus',
 '🔥 Streak Bonus Earned',
 '+1 pt for 4 consecutive meeting attendances. Keep it up!',
 'point_log', false),

('c0000000-0000-0000-0000-000000000012','danger_zone',
 '⚠️ Danger Zone Alert',
 'You are below 15 pts. Please engage more to avoid removal.',
 'point_log', false)
ON CONFLICT DO NOTHING;



INSERT INTO agenda_requests (meeting_id, user_id, topic, description, status, reviewed_by) VALUES
('d0000000-0000-0000-0000-000000000007',
 'c0000000-0000-0000-0000-000000000005',
 'CampusConnect Final Demo',
 'Request to present the final demo of CampusConnect at Meeting #7.',
 'approved',
 'c0000000-0000-0000-0000-000000000002'),

('d0000000-0000-0000-0000-000000000007',
 'c0000000-0000-0000-0000-000000000010',
 'DesignKit npm Package Launch',
 'Announcement of public npm release for DesignKit v1.0.',
 'pending',
 NULL)
ON CONFLICT DO NOTHING;


COMMIT;
