import { WebSocketServer } from "ws"; 

const wss = new WebSocketServer({ port: 8080 }); 

wss.on("connection", (socket) => { 
   console.log("Client connected");

   socket.on("message", (msg) => { 
      console.log("Received:", msg.toString()); 

      // Broadcast ke semua client 
      wss.clients.forEach((client) => { 
         if (client.readyState === 1) { 
            client.send(msg.toString()); 
         } 
      }); 
   }); 
         
   socket.on("close", () => { 
      console.log("Client disconnected"); 
   }); 
   
}); 
console.log("WebSocket running on ws://localhost:8080");