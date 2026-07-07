import { NextResponse } from "next/server";
import { getCurrentResumeUrl } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  const url = await getCurrentResumeUrl();
  if (!url) {
    return new NextResponse("No resume uploaded yet.", { status: 404 });
  }
  return NextResponse.redirect(url, 307);
}
