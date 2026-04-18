import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
   const session = await getAuthenticatedUser();

   if (!session?.id) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
   }

   const users = await prisma.user.findMany({
      select: {
         id: true,
         username: true,
      },
   });
   return NextResponse.json(users);
}
