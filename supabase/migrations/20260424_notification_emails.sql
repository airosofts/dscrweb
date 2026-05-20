CREATE TABLE notification_dscr_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  label text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed existing team emails so nothing breaks on deploy
INSERT INTO notification_dscr_emails (email, label) VALUES
  ('hamza@airosofts.com', 'Hamza'),
  ('roland@ableman.co',   'Roland');
