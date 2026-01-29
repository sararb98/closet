# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `virtual-closet`
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your users
5. Click "Create new project"

## 2. Get Your API Keys

1. Go to Project Settings → API
2. Copy these values for your `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (for server-side only)

## 3. Run the Database Migration

### Option A: Using SQL Editor (Recommended for first setup)

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and click "Run"

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## 4. Configure Authentication

### Enable Email Auth

1. Go to Authentication → Providers
2. Ensure "Email" is enabled
3. Configure email settings:
   - Enable email confirmations (recommended for production)
   - Customize email templates if desired

### Configure Redirect URLs

1. Go to Authentication → URL Configuration
2. Add your site URL: `http://localhost:3000` (for development)
3. Add redirect URLs:
   - `http://localhost:3000/api/auth/callback`
   - `http://localhost:3000/closet`
4. For production, add your production URLs

## 5. Storage Setup

The migration script creates the storage bucket automatically. Verify:

1. Go to Storage in your dashboard
2. You should see a `clothing-images` bucket
3. Verify it's set to "Public" for image access

If the bucket wasn't created, create it manually:

1. Click "New Bucket"
2. Name: `clothing-images`
3. Check "Public bucket"
4. Set file size limit: 5MB
5. Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

## 6. Environment Variables

Create `.env.local` in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 7. Verify Setup

Run this SQL in SQL Editor to verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected output:
- clothing_items
- clothing_tags
- item_tags
- calendar_outfits
- user_preferences

## 8. Test RLS Policies

1. Create a test user via Authentication → Users → Add User
2. Try inserting data with that user's token
3. Verify they can only see their own data

## Troubleshooting

### "permission denied" errors
- Check RLS policies are created
- Verify user is authenticated
- Check user_id matches auth.uid()

### Storage upload fails
- Verify bucket exists and is public
- Check file size is under 5MB
- Verify MIME type is allowed
- Check storage policies are created

### Auth redirect fails
- Verify redirect URLs in Authentication settings
- Check callback route is properly configured
- Ensure cookies are enabled in browser
