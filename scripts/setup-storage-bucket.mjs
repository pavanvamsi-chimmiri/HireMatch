/**
 * Creates the private `resumes` bucket in Supabase if missing.
 * Run: node scripts/setup-storage-bucket.mjs
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.error("Failed to list buckets:", listError.message);
  process.exit(1);
}

const exists = buckets.some((bucket) => bucket.name === "resumes");
if (exists) {
  console.log("✅ resumes bucket already exists");
  process.exit(0);
}

const { error } = await supabase.storage.createBucket("resumes", {
  public: false,
  fileSizeLimit: 10 * 1024 * 1024,
});

if (error) {
  console.error("❌ Failed to create bucket:", error.message);
  process.exit(1);
}

console.log("✅ Created private resumes bucket");
