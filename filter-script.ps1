if (Test-Path scripts/upload-shoe-photos.mjs) {
    $content = Get-Content scripts/upload-shoe-photos.mjs -Raw
    $content = $content -replace "const SUPABASE_URL = '[^']*'", "const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL"
    $content = $content -replace "const SUPABASE_SERVICE_KEY = '[^']*'", "const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY"
    Set-Content scripts/upload-shoe-photos.mjs -Value $content
}
