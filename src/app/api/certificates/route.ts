import { NextResponse } from 'next/server';
import { getCertificates } from '@/lib/data';

export const dynamic = 'force-static';


export async function GET() {
  try {
    const data = await getCertificates();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[API Certificates] Error fetching certificates:', err);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}
