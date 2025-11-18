import prisma from "@/lib/prisma/index.js";

export async function GET(req) {
   const { searchParams } = new URL(req.url);

   const userA = parseInt(searchParams.get("userA"));
   const userB = parseInt(searchParams.get("userB"));

   if (!userA || !userB) {
      return Response.json({ error: "Missing userA or userB" }, { status: 400 });
   }

   const messages = await prisma.message.findMany({
      where: {
         OR: [
            { senderId: userA, receiverId: userB },
            { senderId: userB, receiverId: userA },
         ],
      },
      orderBy: { createdAt: "asc" },
   });

   return Response.json(messages);
}
