import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/index.js";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req) {
   const session = await getAuthenticatedUser();

   if (!session?.id) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
   }

   const { searchParams } = new URL(req.url);
   const otherUserId = Number(searchParams.get("userId"));

   if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
      return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 });
   }

   const messages = await prisma.message.findMany({
      where: {
         OR: [
            { senderId: session.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: session.id },
         ],
      },
      orderBy: { createdAt: "asc" },
   });

   return NextResponse.json(messages);
}

export async function POST(req) {
   const session = await getAuthenticatedUser();

   if (!session?.id) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
   }

   try {
      const { to, content } = await req.json();
      const receiverId = Number(to);
      const trimmedContent = typeof content === "string" ? content.trim() : "";

      if (!Number.isInteger(receiverId) || receiverId <= 0) {
         return NextResponse.json({ error: "Invalid receiver" }, { status: 400 });
      }

      if (!trimmedContent) {
         return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
      }

      if (receiverId === session.id) {
         return NextResponse.json({ error: "Cannot send to yourself" }, { status: 400 });
      }

      const receiver = await prisma.user.findUnique({
         where: { id: receiverId },
         select: { id: true },
      });

      if (!receiver) {
         return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
      }

      const message = await prisma.message.create({
         data: {
            content: trimmedContent,
            senderId: session.id,
            receiverId,
         },
      });

      return NextResponse.json(message, { status: 201 });
   } catch (error) {
      console.error("Create message error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
   }
}
