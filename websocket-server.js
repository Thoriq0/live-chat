import { WebSocketServer } from "ws";
import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();
const wss = new WebSocketServer({ port: 8080 });

// Map userId -> socket
const clients = new Map();

wss.on("connection", (socket) => {
   // console.log("Client connected");

   let authenticatedUserId = null;

   socket.on("message", async (raw) => {
      try {
         const text = raw.toString(); // FIX BUFFER  STRING
         const msg = JSON.parse(text);

         // AUTH 
         if (msg.type === "auth") {
            const { userId } = msg;

            if (!userId) {
               socket.send(JSON.stringify({ type: "auth_error" }));
               socket.close();
               return;
            }

            authenticatedUserId = userId;
            clients.set(authenticatedUserId, socket);

            // console.log("User authenticated:", authenticatedUserId);

            socket.send(
               JSON.stringify({
                  type: "auth_ok",
                  userId: authenticatedUserId,
               })
            );
            return;
         }

         // MESSAGE
         if (msg.type === "message") {
            const { from, to, content } = msg;

            // console.log(`Message from ${from} to ${to}:`, content);

            // Save message to DB
            await prisma.message.create({
               data: {
                  content,
                  senderId: from,
                  receiverId: to,
               },
            });

            // Send to receiver
            const targetSocket = clients.get(to);
            if (targetSocket && targetSocket.readyState === 1) {
               targetSocket.send(JSON.stringify(msg));
            }

            // Send back to sender
            socket.send(JSON.stringify(msg));
         }

      } catch (err) {
         console.log("Invalid WS message:", raw);
      }
   });

   socket.on("close", () => {
      console.log("Client disconnected");

      if (authenticatedUserId) {
         clients.delete(authenticatedUserId);
      }
   });
});

console.log("WebSocket running on ws://localhost:8080");
