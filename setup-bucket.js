const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:boombastic10@db.kdkgiiiqzmejdrxkqvmo.supabase.co:5432/postgres"
    }
  }
});

async function main() {
  try {
    console.log("Creating bucket...");
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('thumbnails', 'thumbnails', true) 
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("Bucket created!");

    console.log("Adding RLS policies...");
    
    // Enable RLS just in case
    await prisma.$executeRawUnsafe(`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);

    // Allow anon inserts
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Allow anon uploads to thumbnails" 
      ON storage.objects 
      FOR INSERT 
      WITH CHECK (bucket_id = 'thumbnails');
    `).catch(e => console.log("Policy might already exist:", e.message));

    // Allow public reads
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Allow public reads of thumbnails" 
      ON storage.objects 
      FOR SELECT 
      USING (bucket_id = 'thumbnails');
    `).catch(e => console.log("Policy might already exist:", e.message));

    console.log("RLS policies added!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
