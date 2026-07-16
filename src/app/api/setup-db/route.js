import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    console.log("Creating bucket...");
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('thumbnails', 'thumbnails', true) 
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("Adding RLS policies...");
    await prisma.$executeRawUnsafe(`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`).catch(()=>null);
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Allow anon uploads to thumbnails" 
      ON storage.objects 
      FOR INSERT 
      WITH CHECK (bucket_id = 'thumbnails');
    `).catch(()=>null);

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Allow public reads of thumbnails" 
      ON storage.objects 
      FOR SELECT 
      USING (bucket_id = 'thumbnails');
    `).catch(()=>null);

    return NextResponse.json({ success: true, message: "Storage configured!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
