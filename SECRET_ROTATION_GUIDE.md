# Supabase Service Key Rotation - Complete Guide

## ✅ What's Been Done

1. **Secured the code** - Moved hardcoded service key from `scripts/upload-shoe-photos.mjs` to `.env.local`
2. **Added environment variable support** - Script now reads from `process.env.SUPABASE_SERVICE_KEY`
3. **Updated .gitignore** - `.env.local` is already properly ignored
4. **Committed the fix** - Changes staged and committed (removed secret from working code)

---

## ⚠️ Important: Secret Still in Git History

The exposed secret is still in commit `3538cbd`. You need to clean this from the repository history.

### Option A: Using git-filter-repo (Recommended)

```bash
# Install git-filter-repo if not already installed
# On Windows with Git Bash:
pip install git-filter-repo

# Navigate to your repository
cd c:\Users\robledos\closet

# Remove the secret from all commits
git filter-repo --invert-paths --path scripts/upload-shoe-photos.mjs

# OR, if you want to keep the file but remove the secret content from history:
# Use the replace filter approach (requires git filter-repo 0.11.0+)
git filter-repo --replace-refs update-no-branch
```

### Option B: Manual Force Push (If small history)

If this is a small/new repo:
```bash
# Simply force push to remove the commits
git push origin --force-with-lease
```

### Option C: On GitGuardian

Once you've pushed, GitGuardian will update the alert status to "Revoked" automatically.

---

## 🔄 Rotating the Key in Supabase

Since this is a legacy `service_role` JWT key, **you cannot rotate it directly**. You must:

### Step 1: Migrate to New API Keys (Recommended)

Go to [Supabase Dashboard](https://app.supabase.com) → **Settings > API Keys**

1. Click the **"Publishable and secret API keys"** tab
2. If you see "Create new API keys" button:
   - Click it to create new `sb_publishable_...` and `sb_secret_...` keys
   - Both legacy and new keys work simultaneously
   - Your project is now supporting both systems

### Step 2: Update Your Code

Replace the service key usage:

```javascript
// OLD (legacy JWT-based):
const client = createClient(URL, serviceRoleJWT)

// NEW (secret key-based):
const client = createClient(URL, process.env.SUPABASE_SECRET_KEY)
```

Update `.env.local`:
```env
SUPABASE_SECRET_KEY=sb_secret_[new key here]
```

### Step 3: Revoke the Legacy Service Role Key

Back in Supabase Dashboard → **Settings > JWT Keys**:
1. Go to **"JWT Signing Keys"** tab
2. Click **"Rotate Keys"** to invalidate old keys
3. Click the action menu (...) on previously used keys and select **"Revoke"**

---

## 📋 Verification Checklist

- [ ] `.env.local` has `SUPABASE_SERVICE_KEY` (or will migrate to `SUPABASE_SECRET_KEY`)
- [ ] `.env.local` is in `.gitignore`
- [ ] Script reads from environment variables, not hardcoded
- [ ] Git history cleaned with `git filter-repo` or forced pushed
- [ ] New API keys created in Supabase dashboard
- [ ] Old JWT signing keys revoked in Supabase
- [ ] No secrets visible in any git commit: `git log -S 'eyJhbGc'` returns nothing
- [ ] Push to remote with `git push --force-with-lease`

---

## 🔒 Security Best Practices Going Forward

1. **Never commit secrets** - Always use `.env.local` or equivalent
2. **Use secret scanning** - Enable GitGuardian, Deepscan, or similar in CI/CD
3. **Rotate keys regularly** - Quarterly rotation recommended
4. **Use new API keys** - Prefer `sb_secret_...` and `sb_publishable_...` over legacy JWT keys
5. **Audit access logs** - Check who/what used each key in Supabase logs

---

## 📞 Additional Resources

- [Rotating Anon, Service, and JWT Secrets](https://supabase.com/docs/guides/troubleshooting/rotating-anon-service-and-jwt-secrets-1Jq6yd)
- [Understanding API Keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Migrating to New API Keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
- [JWT Signing Keys](https://supabase.com/docs/guides/auth/signing-keys)
