// This is a script you can run to set up the Supabase storage bucket
// Run with: npx tsx scripts/setup-storage.ts

import { createClient } from "@supabase/supabase-js"

async function setupStorage() {
  // Replace with your Supabase URL and service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or service role key")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Check if the bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error("Error listing buckets:", listError)
    process.exit(1)
  }

  const bucketName = "properties"
  const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

  if (bucketExists) {
    console.log(`Bucket "${bucketName}" already exists`)
  } else {
    // Create the bucket
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true, // Make the bucket public
    })

    if (createError) {
      console.error("Error creating bucket:", createError)
      process.exit(1)
    }

    console.log(`Bucket "${bucketName}" created successfully`)

    // Set up RLS policies for the bucket
    const { error: policyError } = await supabase.storage.from(bucketName).createPolicy("public-read", {
      name: "Public Read Access",
      definition: {
        role: "authenticated",
        operations: ["SELECT", "INSERT", "UPDATE", "DELETE"],
      },
    })

    if (policyError) {
      console.error("Error setting bucket policy:", policyError)
      console.log("You may need to set up policies manually in the Supabase dashboard")
    } else {
      console.log("Bucket policies set up successfully")
    }
  }

  console.log("Storage setup complete")
}

setupStorage().catch(console.error)
