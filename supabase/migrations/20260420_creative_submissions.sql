-- Creative submissions: advertisers submit ad creative after paying
CREATE TABLE creative_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES ad_subscriptions(id),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  ad_type text NOT NULL CHECK (ad_type IN ('banner', 'popup')),
  description text,
  notes text,
  banner_images text[] DEFAULT '{}',
  popup_images text[] DEFAULT '{}',
  logo_files text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'revision_needed', 'rejected')),
  admin_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Token to gate creative submission form access
ALTER TABLE ad_subscriptions ADD COLUMN IF NOT EXISTS submission_token text;

-- Track if we sent the 24h creative reminder
ALTER TABLE ad_subscriptions ADD COLUMN IF NOT EXISTS creative_reminder_sent_at timestamptz;
