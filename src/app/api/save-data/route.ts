import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getRegistry } from '@/lib/data';

const FALLBACK_DATABASE: Record<string, string> = {
  executives: 'resources/data/executives.json',
  projects: 'resources/data/projects.json',
  events: 'resources/data/events.json',
  courses: 'resources/data/courses.json',
  achievements: 'resources/data/achievements.json',
  cv: 'resources/data/cv.json',
  certificates: 'resources/certificates/data/certificates.json',
};

export async function POST(request: Request) {
  // Only allow direct file writes in local development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'File saving is only allowed in local development mode.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    let registry;
    try {
      registry = await getRegistry();
    } catch (err) {
      console.error('[API Save] Failed to load registry, using fallback:', err);
      registry = FALLBACK_DATABASE;
    }

    const fileRelativePath = registry[type] || FALLBACK_DATABASE[type];
    if (!fileRelativePath) {
      return NextResponse.json({ error: `Invalid database type: ${type}` }, { status: 400 });
    }

    const absolutePath = path.join(process.cwd(), 'public', fileRelativePath);

    // Validate JSON structure before saving
    const jsonString = JSON.stringify(data, null, 2);

    // Write changes back to filesystem
    await fs.writeFile(absolutePath, jsonString, 'utf-8');

    console.log(`[API Save] Successfully wrote updates to ${absolutePath}`);
    return NextResponse.json({ success: true, message: `Successfully updated ${type}` });
  } catch (err: any) {
    console.error('[API Save Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to save changes' }, { status: 500 });
  }
}
