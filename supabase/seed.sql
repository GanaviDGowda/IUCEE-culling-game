-- Culling Game demo data.
-- Requires demo Auth users first: POST supabase/functions/seed-demo with the service role key.

BEGIN;

INSERT INTO system_config (key, value, description) VALUES
  ('min_pts_danger_zone', '15', 'Quarterly pts below which danger zone triggers'),
  ('min_pts_removal', '6', 'Quarterly pts below which removal workflow triggers'),
  ('streak_bonus_threshold', '4', 'Consecutive meetings for streak bonus'),
  ('century_cost', '100', 'Pts required to activate Century'),
  ('year_end_decay_cap', '80', 'Redeemable pts above this reset to 50 at year-end'),
  ('year_end_decay_to', '50', 'Reset value on year-end decay'),
  ('skip_token_earn_threshold', '5', 'Monthly pts to earn a skip token'),
  ('max_skip_tokens_tier1', '1', 'Max skip tokens per month Tier 0/1'),
  ('max_skip_tokens_tier2', '2', 'Max skip tokens per month Tier 2+'),
  ('mentor_bonus_pts', '1', 'Pts mentor earns on mentee milestone'),
  ('mentee_milestone_pts', '5', 'Monthly pts mentee must earn for mentor bonus'),
  ('nodal_min_meetings', '2', 'Min meetings per quarter for nodal officer'),
  ('referral_bonus_pts', '3', 'Pts for successful referral'),
  ('century_post_min_pts', '30', 'Raised min after century activation')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();

INSERT INTO quarters (id, label, start_date, end_date, is_current, is_archived, is_active, archived) VALUES
  ('00000000-0000-0000-0000-000000000001', '2026-Q1', '2026-01-01', '2026-03-31', false, true, false, true),
  ('00000000-0000-0000-0000-000000000002', '2026-Q2', '2026-04-01', '2026-06-30', true, false, true, false)
ON CONFLICT (label) DO UPDATE SET
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  is_current = EXCLUDED.is_current,
  is_archived = EXCLUDED.is_archived,
  is_active = EXCLUDED.is_active,
  archived = EXCLUDED.archived;

INSERT INTO registration_requests
  (id, name, email, usn, phone, branch, year, status, submitted_at, reviewed_at, reviewed_by, review_note)
VALUES
  ('90000000-0000-0000-0000-000000000001', 'Suraj Patil', 'suraj.patil24@mcehassan.ac.in', '4MC24CS101', '9900002001', 'CSE', '1', 'pending', now() - interval '2 days', NULL, NULL, NULL),
  ('90000000-0000-0000-0000-000000000002', 'Namitha Kamath', 'namitha.kamath23@mcehassan.ac.in', '4MC23ECE042', '9900002002', 'ECE', '2', 'pending', now() - interval '1 day', NULL, NULL, NULL),
  ('90000000-0000-0000-0000-000000000003', 'Harish Gowda', 'harish.gowda24@mcehassan.ac.in', '4MC24ME015', '9900002003', 'MECH', '1', 'pending', now() - interval '3 hours', NULL, NULL, NULL),
  ('90000000-0000-0000-0000-000000000004', 'Arjun Krishnamurthy', '4mc21cs010@mcehassan.ac.in', '4MC21CS010', '9900001001', 'CSE', '3', 'approved', now() - interval '90 days', now() - interval '89 days', 'a0000000-0000-0000-0000-000000000001', 'Verified USN with college records'),
  ('90000000-0000-0000-0000-000000000005', 'Unknown Student', 'random123@gmail.com', '4MC20XX999', NULL, 'CSE', '1', 'rejected', now() - interval '10 days', now() - interval '9 days', 'a0000000-0000-0000-0000-000000000001', 'Non-college email. USN not found in records.')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  reviewed_by = EXCLUDED.reviewed_by,
  review_note = EXCLUDED.review_note,
  reviewed_at = EXCLUDED.reviewed_at;

UPDATE users
SET registration_id = '90000000-0000-0000-0000-000000000004'
WHERE id = 'c0000000-0000-0000-0000-000000000001';

INSERT INTO meetings (id, title, date, time, location, agenda, minutes, is_holiday, created_by) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Weekly Meeting #1', '2026-04-07', '17:00', 'Seminar Hall A', 'Intro to Q2, project updates, upcoming hackathons', 'Attendance: 11/15. Arjun presented React project update. Vikram discussed robotics.', false, 'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000002', 'Weekly Meeting #2', '2026-04-14', '17:00', 'Seminar Hall A', 'Tech talk: ML fundamentals, project check-ins', 'Attendance: 13/15. Sneha gave ML intro talk. Nikhil IoT demo.', false, 'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000003', 'Weekly Meeting #3', '2026-04-21', '17:00', 'Seminar Hall B', 'Hackathon prep, project updates, CIE discussions', 'Attendance: 10/15. Karthik presented AUTO project. Aditya spoke on DSA.', false, 'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000004', 'Weekly Meeting #4', '2026-04-28', '17:00', 'Seminar Hall A', 'Post-hackathon review, new project registrations', 'Attendance: 12/15. Hackathon results announced. 3 new projects registered.', false, 'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000005', 'Weekly Meeting #5', '2026-05-05', '17:00', 'Seminar Hall A', 'Industry visit debrief, skill sessions', 'Attendance: 14/15. Meghana design talk. Industry visit applications open.', false, 'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000006', 'Weekly Meeting #6', '2026-05-12', '17:00', 'Seminar Hall B', 'Project milestone review, presentation slots', 'Attendance: 9/15. Rahul ISE project update. Rohit mechanical design talk.', false, 'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000007', 'Weekly Meeting #7', '2026-05-19', '17:00', 'Seminar Hall A', 'Open tech share, upcoming NSS event', 'Attendance: 13/15. Tejas web dev intro. Priya biotech project.', false, 'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000008', 'Weekly Meeting #8', '2026-05-26', '17:00', 'Seminar Hall A', 'Quarter midpoint review, danger zone check', 'Admin reviewed danger zone members. Action plans issued.', false, 'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000009', 'Weekly Meeting #9', '2026-06-02', '17:00', 'Seminar Hall A', 'Project funding proposals, mentorship pairing', NULL, false, 'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000010', 'Weekly Meeting #10', '2026-06-09', '17:00', 'Seminar Hall B', 'Final project demos, quarter wrap-up prep', NULL, false, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  date = EXCLUDED.date,
  time = EXCLUDED.time,
  location = EXCLUDED.location,
  agenda = EXCLUDED.agenda,
  minutes = EXCLUDED.minutes;

UPDATE meetings
SET quarter_id = '00000000-0000-0000-0000-000000000002'
WHERE date BETWEEN '2026-04-01' AND '2026-06-30';

INSERT INTO events (
  id, name, type, description, event_date, apply_deadline, external_link,
  proof_required, pts_1st, pts_2nd, pts_special, pts_participation,
  pts_offered, pts_applied, created_by
) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Smart India Hackathon - Internal Round', 'hackathon', 'Internal selection round for SIH 2026. Top 3 teams proceed.', '2026-04-19 09:00:00+05:30', '2026-04-15 23:59:00+05:30', NULL, true, 5, 4, 3, 2, NULL, NULL, 'a0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000002', 'Bosch Industry Visit - Hassan Plant', 'industry_visit', 'Selected students visit Bosch Rexroth facility. Company selects 5 students.', '2026-05-10 09:00:00+05:30', '2026-05-03 23:59:00+05:30', NULL, false, NULL, NULL, NULL, NULL, 4, 3, 'a0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000003', 'EWB Cultural Fest - TechXpressions', 'cultural', 'Annual cultural and technical fest. Points for participation.', '2026-05-23 09:00:00+05:30', '2026-05-18 23:59:00+05:30', NULL, true, NULL, NULL, NULL, 2, NULL, NULL, 'a0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000004', 'NSS Special Camp', 'nss', '7-day NSS special camp. Students who apply earn points.', '2026-06-01 09:00:00+05:30', '2026-05-25 23:59:00+05:30', NULL, true, NULL, NULL, NULL, NULL, NULL, 3, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  event_date = EXCLUDED.event_date,
  apply_deadline = EXCLUDED.apply_deadline;

UPDATE events
SET quarter_id = '00000000-0000-0000-0000-000000000002'
WHERE event_date::date BETWEEN '2026-04-01' AND '2026-06-30';

INSERT INTO projects (id, quarter_id, name, description, github_url, owner_id, status, funded, funded_pts_claimed, active) VALUES
  ('f0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'AgriSense - IoT Soil Monitor', 'Low-cost soil moisture and NPK sensor array with LoRa connectivity for farmers.', 'https://github.com/mce-ewb/agrisense', 'c0000000-0000-0000-0000-000000000005', 'funded', true, true, true),
  ('f0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'CampusTrack - Attendance Web App', 'QR-based attendance system for MCE departments. Built with Next.js and Supabase.', 'https://github.com/mce-ewb/campustrack', 'c0000000-0000-0000-0000-000000000001', 'active', false, false, true),
  ('f0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'EcoBot - Waste Sorter', 'Computer vision based waste classification robot using Raspberry Pi and TensorFlow Lite.', 'https://github.com/mce-ewb/ecobot', 'c0000000-0000-0000-0000-000000000013', 'active', false, false, true),
  ('f0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'MediRemind - Patient App', 'Flutter app for medication reminders with caregiver alerts.', NULL, 'c0000000-0000-0000-0000-000000000008', 'dormant', false, false, false)
ON CONFLICT (id) DO UPDATE SET
  quarter_id = EXCLUDED.quarter_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  github_url = EXCLUDED.github_url,
  owner_id = EXCLUDED.owner_id,
  status = EXCLUDED.status,
  funded = EXCLUDED.funded,
  active = EXCLUDED.active;

INSERT INTO project_collaborators (project_id, user_id) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005'),
  ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000009'),
  ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000011'),
  ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000007'),
  ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000013'),
  ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003'),
  ('f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000008'),
  ('f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000012')
ON CONFLICT DO NOTHING;

INSERT INTO attendance (meeting_id, user_id, marked_by, used_skip)
SELECT m.id, u.id, 'a0000000-0000-0000-0000-000000000001', false
FROM meetings m
JOIN users u ON u.role = 'student'
WHERE m.date BETWEEN '2026-04-21' AND '2026-05-26'
  AND u.id NOT IN (
    'c0000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000010',
    'c0000000-0000-0000-0000-000000000014'
  )
ON CONFLICT (meeting_id, user_id) DO NOTHING;

INSERT INTO attendance (meeting_id, user_id, marked_by, used_skip) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', false),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', false)
ON CONFLICT (meeting_id, user_id) DO NOTHING;

INSERT INTO point_logs
  (user_id, type, points, redeemable_delta, lifetime_delta, status, awarded_by, note, meeting_id, event_id, project_id, quarter_id, quarter)
VALUES
  ('c0000000-0000-0000-0000-000000000001','attendance',1,1,1,'confirmed','a0000000-0000-0000-0000-000000000001','Meeting #1','d0000000-0000-0000-0000-000000000001',NULL,NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000001','presentation',2,2,2,'confirmed','a0000000-0000-0000-0000-000000000001','ML frameworks talk','d0000000-0000-0000-0000-000000000002',NULL,NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000001','hackathon_first',5,5,5,'confirmed','a0000000-0000-0000-0000-000000000001','SIH Internal 1st place',NULL,'e0000000-0000-0000-0000-000000000001',NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000001','industry_offered',4,4,4,'confirmed','a0000000-0000-0000-0000-000000000001','Bosch visit selected',NULL,'e0000000-0000-0000-0000-000000000002',NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000005','hackathon_second',4,4,4,'confirmed','a0000000-0000-0000-0000-000000000001','SIH Internal 2nd place',NULL,'e0000000-0000-0000-0000-000000000001',NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000005','project_funded',5,5,5,'confirmed','a0000000-0000-0000-0000-000000000001','AgriSense received KSCST grant',NULL,NULL,'f0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000015','hackathon_special',3,3,3,'confirmed','a0000000-0000-0000-0000-000000000001','SIH special mention',NULL,'e0000000-0000-0000-0000-000000000001',NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000009','hackathon_participation',2,2,2,'confirmed','a0000000-0000-0000-0000-000000000001','SIH participation',NULL,'e0000000-0000-0000-0000-000000000001',NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000013','hackathon_participation',2,2,2,'confirmed','a0000000-0000-0000-0000-000000000001','SIH participation',NULL,'e0000000-0000-0000-0000-000000000001',NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000003','industry_applied',3,3,3,'confirmed','a0000000-0000-0000-0000-000000000001','Bosch visit application',NULL,'e0000000-0000-0000-0000-000000000002',NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000008','industry_applied',3,3,3,'confirmed','a0000000-0000-0000-0000-000000000001','Bosch visit application',NULL,'e0000000-0000-0000-0000-000000000002',NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000006','attendance',1,1,1,'confirmed','a0000000-0000-0000-0000-000000000001','Meeting #5','d0000000-0000-0000-0000-000000000005',NULL,NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000006','attendance',1,1,1,'confirmed','a0000000-0000-0000-0000-000000000001','Meeting #7','d0000000-0000-0000-0000-000000000007',NULL,NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000010','attendance',1,1,1,'confirmed','a0000000-0000-0000-0000-000000000001','Meeting #5','d0000000-0000-0000-0000-000000000005',NULL,NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000010','attendance',1,1,1,'confirmed','a0000000-0000-0000-0000-000000000001','Meeting #7','d0000000-0000-0000-0000-000000000007',NULL,NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000003','presentation',2,2,2,'pending',NULL,'ISE cloud project overview flagged by nodal','d0000000-0000-0000-0000-000000000006',NULL,NULL,'00000000-0000-0000-0000-000000000002','2026-Q2'),
  ('c0000000-0000-0000-0000-000000000012','presentation',2,2,2,'pending',NULL,'Biotech project weekly update talk flagged by nodal','d0000000-0000-0000-0000-000000000007',NULL,NULL,'00000000-0000-0000-0000-000000000002','2026-Q2')
ON CONFLICT DO NOTHING;

INSERT INTO event_registrations
  (event_id, user_id, registered_at, placement, proof_url, verified, verified_by, verified_at, pts_awarded)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '2026-04-14 10:00:00+05:30', '1st', 'proof-uploads/sih_arjun.pdf', true, 'a0000000-0000-0000-0000-000000000001', '2026-04-22 09:00:00+05:30', 5),
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', '2026-04-14 11:00:00+05:30', '2nd', 'proof-uploads/sih_vikram.pdf', true, 'a0000000-0000-0000-0000-000000000001', '2026-04-22 09:00:00+05:30', 4),
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000015', '2026-04-14 12:00:00+05:30', 'special', 'proof-uploads/sih_aditya.pdf', true, 'a0000000-0000-0000-0000-000000000001', '2026-04-22 09:00:00+05:30', 3),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '2026-05-02 09:00:00+05:30', 'offered', NULL, true, 'a0000000-0000-0000-0000-000000000001', '2026-05-11 10:00:00+05:30', 4),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', '2026-05-02 10:00:00+05:30', 'applied', NULL, true, 'a0000000-0000-0000-0000-000000000001', '2026-05-11 10:00:00+05:30', 3)
ON CONFLICT (event_id, user_id) DO UPDATE SET
  placement = EXCLUDED.placement,
  verified = EXCLUDED.verified,
  verified_by = EXCLUDED.verified_by,
  pts_awarded = EXCLUDED.pts_awarded;

INSERT INTO member_quarter_stats
  (user_id, quarter_id, pts_earned, pts_spent, pts_net, meetings_attended, presentations)
VALUES
  ('c0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',14,0,14,7,1),
  ('c0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002',10,0,10,6,1),
  ('c0000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002',9,0,9,6,0),
  ('c0000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000002',5,0,5,5,0),
  ('c0000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000002',17,0,17,8,0),
  ('c0000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000002',2,0,2,2,0),
  ('c0000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000002',6,0,6,5,1),
  ('c0000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000002',9,0,9,6,1),
  ('c0000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000002',11,0,11,7,1),
  ('c0000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000002',2,0,2,2,0),
  ('c0000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000002',5,0,5,5,1),
  ('c0000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000002',4,0,4,4,0),
  ('c0000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000002',8,0,8,6,1),
  ('c0000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000002',1,0,1,1,0),
  ('c0000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000002',7,0,7,6,0)
ON CONFLICT (user_id, quarter_id) DO UPDATE SET
  pts_earned = EXCLUDED.pts_earned,
  pts_spent = EXCLUDED.pts_spent,
  pts_net = EXCLUDED.pts_net,
  meetings_attended = EXCLUDED.meetings_attended,
  presentations = EXCLUDED.presentations;

INSERT INTO presentations
  (meeting_id, presenter_id, topic, flagged_by, flagged_at, confirmed_by, confirmed_at, status)
VALUES
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'ML Frameworks Overview', 'b0000000-0000-0000-0000-000000000001', '2026-04-14 18:00:00+05:30', 'a0000000-0000-0000-0000-000000000001', '2026-04-15 09:00:00+05:30', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'React Hooks Deep Dive', 'b0000000-0000-0000-0000-000000000001', '2026-04-14 18:05:00+05:30', 'a0000000-0000-0000-0000-000000000001', '2026-04-15 09:05:00+05:30', 'confirmed'),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'ISE Cloud Project Overview', 'b0000000-0000-0000-0000-000000000001', '2026-05-12 18:00:00+05:30', NULL, NULL, 'pending'),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000012', 'Biotech Project Weekly Update', 'b0000000-0000-0000-0000-000000000001', '2026-05-19 18:00:00+05:30', NULL, NULL, 'pending')
ON CONFLICT (meeting_id, presenter_id) DO UPDATE SET
  topic = EXCLUDED.topic,
  status = EXCLUDED.status,
  confirmed_by = EXCLUDED.confirmed_by,
  confirmed_at = EXCLUDED.confirmed_at;

INSERT INTO project_updates
  (project_id, user_id, meeting_id, content, flagged_by, flagged_at, reviewed_by, reviewed_at, status)
VALUES
  ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'Completed QR scan module. Backend routes for attendance submission done.', 'b0000000-0000-0000-0000-000000000001', '2026-04-21 18:00:00+05:30', 'a0000000-0000-0000-0000-000000000001', '2026-04-22 09:00:00+05:30', 'confirmed'),
  ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000004', 'Sensor array calibrated. LoRa range tested at 800m.', 'b0000000-0000-0000-0000-000000000001', '2026-04-28 18:00:00+05:30', 'a0000000-0000-0000-0000-000000000001', '2026-04-29 10:00:00+05:30', 'confirmed'),
  ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000007', 'Object detection model at 87 percent accuracy on test set.', 'b0000000-0000-0000-0000-000000000001', '2026-05-19 18:00:00+05:30', NULL, NULL, 'pending'),
  ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000008', 'Dashboard UI complete. Admin panel for bulk attendance operational.', 'b0000000-0000-0000-0000-000000000001', '2026-05-26 18:00:00+05:30', NULL, NULL, 'pending')
ON CONFLICT (project_id, meeting_id) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  reviewed_by = EXCLUDED.reviewed_by,
  reviewed_at = EXCLUDED.reviewed_at;

INSERT INTO warnings (user_id, issued_by, reason, quarter_id) VALUES
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Below 15 pts at quarter midpoint. Issued action plan.', '00000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Only 2 attendances in 8 weeks. Mandatory attendance required.', '00000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

INSERT INTO announcements (title, body, tag, pinned, author_id) VALUES
  ('Welcome to Q2 2026!', 'A new quarter begins. Focus on your projects and presentations. Minimum 15 pts required to stay active.', 'general', true, 'a0000000-0000-0000-0000-000000000001'),
  ('SIH Internal Round - Results', 'Congratulations to Arjun, Vikram, and Aditya. Points have been awarded.', 'event', true, 'a0000000-0000-0000-0000-000000000001'),
  ('Bosch Industry Visit Applications Open', 'Apply before May 3rd. Students who apply earn points. Selected students earn more.', 'urgent', true, 'b0000000-0000-0000-0000-000000000001'),
  ('Danger Zone Alert - Action Required', 'Two members are currently in the Danger Zone. See admin for an action plan immediately.', 'urgent', false, 'a0000000-0000-0000-0000-000000000001'),
  ('NSS Special Camp - June 1st', 'Apply by May 25th to earn points. Certificate provided.', 'event', false, 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO mentorships (mentor_id, mentee_id, active, started_at) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', true, '2026-04-10 10:00:00+05:30'),
  ('c0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000004', true, '2026-04-10 10:00:00+05:30')
ON CONFLICT DO NOTHING;

INSERT INTO point_appeals (user_id, point_log_id, reason, status, submitted_at)
SELECT 'c0000000-0000-0000-0000-000000000006', id, 'I was present for Meeting #3 but my attendance was not marked. I have photos to prove.', 'pending', now() - interval '2 days'
FROM point_logs
WHERE user_id = 'c0000000-0000-0000-0000-000000000006'
LIMIT 1
ON CONFLICT (point_log_id) DO NOTHING;

INSERT INTO cie_bonus_log (applied_by, meeting_id, members_count, month) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 14, '2026-05')
ON CONFLICT (month) DO UPDATE SET
  applied_by = EXCLUDED.applied_by,
  meeting_id = EXCLUDED.meeting_id,
  members_count = EXCLUDED.members_count;

INSERT INTO college_holidays (holiday_date, name, created_by) VALUES
  ('2026-04-14', 'Dr. Ambedkar Jayanti', 'a0000000-0000-0000-0000-000000000001'),
  ('2026-05-01', 'Karnataka Rajyotsava', 'a0000000-0000-0000-0000-000000000001'),
  ('2026-06-21', 'Eid al-Adha', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (holiday_date) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO user_badges (user_id, badge_id, earned_at)
SELECT 'c0000000-0000-0000-0000-000000000001', id, '2026-04-08 09:00:00+05:30' FROM badges WHERE slug = 'first_step'
ON CONFLICT DO NOTHING;
INSERT INTO user_badges (user_id, badge_id, earned_at)
SELECT 'c0000000-0000-0000-0000-000000000001', id, '2026-04-22 09:00:00+05:30' FROM badges WHERE slug = 'hackathon_hero'
ON CONFLICT DO NOTHING;
INSERT INTO user_badges (user_id, badge_id, earned_at)
SELECT 'c0000000-0000-0000-0000-000000000001', id, '2026-04-15 09:00:00+05:30' FROM badges WHERE slug = 'speaker'
ON CONFLICT DO NOTHING;
INSERT INTO user_badges (user_id, badge_id, earned_at)
SELECT 'c0000000-0000-0000-0000-000000000005', id, '2026-05-01 09:00:00+05:30' FROM badges WHERE slug = 'funded'
ON CONFLICT DO NOTHING;
INSERT INTO user_badges (user_id, badge_id, earned_at)
SELECT 'c0000000-0000-0000-0000-000000000009', id, '2026-05-10 09:00:00+05:30' FROM badges WHERE slug = 'streak_master'
ON CONFLICT DO NOTHING;
INSERT INTO user_badges (user_id, badge_id, earned_at)
SELECT 'c0000000-0000-0000-0000-000000000015', id, '2026-01-15 09:00:00+05:30' FROM badges WHERE slug = 'centurion'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, body, type, read) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Points awarded: +5', 'You earned 5 pts for SIH Internal Hackathon 1st place.', 'points_awarded', true),
  ('c0000000-0000-0000-0000-000000000001', 'Streak bonus: +1 pt', 'You attended 4 consecutive meetings. Bonus point awarded.', 'streak_bonus', true),
  ('c0000000-0000-0000-0000-000000000006', 'Danger Zone', 'You have only 11 pts this quarter. Minimum is 15. Take action immediately.', 'danger_zone', false),
  ('c0000000-0000-0000-0000-000000000010', 'Danger Zone', 'You have only 5 pts this quarter. Risk of removal. Contact admin.', 'danger_zone', false),
  ('c0000000-0000-0000-0000-000000000015', 'Aditya activated Century status', 'Aditya Joshi has activated Century status.', 'century_activated', true),
  ('c0000000-0000-0000-0000-000000000005', 'Project funded: +5 pts', 'AgriSense project received KSCST grant. 5 bonus points awarded.', 'points_awarded', false),
  ('c0000000-0000-0000-0000-000000000007', 'Welcome to EWB IUCEE Chapter', 'Your registration has been approved. Attend your first meeting to earn points.', 'registration_approved', true)
ON CONFLICT DO NOTHING;

COMMIT;
