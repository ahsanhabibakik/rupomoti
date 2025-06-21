import { NextRequest, NextResponse } from "next/server";

// In-memory store for demonstration (replace with DB or email service in production)
const emails: string[] = [];

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    // Store or process the email (replace with DB or email service)
    emails.push(email);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
} 