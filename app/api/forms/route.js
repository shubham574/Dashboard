import { getForms } from '../../../lib/wordpress';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const forms = await getForms();
    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { message: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}
