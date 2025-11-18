import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
   const cookieStore = await cookies();
   const token = cookieStore.get("token")?.value;

   if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
   }

   try {
      const secret = process.env.NEXT_PUBLIC_JWT_SECRET || "SECRET_KEY";
      const decoded = jwt.verify(token, secret);

      const user = await prisma.user.findUnique({
         where: { id: decoded.id },
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
