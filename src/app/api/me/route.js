import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
   const session = await getAuthenticatedUser();

   if (!session?.id) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
   }

   try {
      const user = await prisma.user.findUnique({
         where: { id: session.id },
         select: { id: true, username: true },
      });

      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
   } catch (err) {
      console.error("JWT Error:", err);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
   }
}
