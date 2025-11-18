import { PrismaClient } from "../src/generated/prisma/index.js";
const prisma = new PrismaClient();

async function main() {
   await prisma.user.deleteMany();
   await prisma.user.createMany({
      data: [
         {
            username: "thoriq",
            password: "$2b$10$CQaBo62eJU.oDTWvNPo8veOT1JGxZHZZTj.aTJVEJrpI9PmWIvAse", // hash password123
         },
         {
            username: "ahmad",
            password: "$2b$10$gBhE.4/J5IHRrA/eiQz8BeHp4Nv4PFbYbHGjDt9cnjYpVj8Mpasbu", // hash password123
         },
         {
            username: "husain",
            password: "$2b$10$vYf1ffjqcS2V6DmiAuN8Uure3mOaZ3RzipVQR9.qQzVNem1SvJNWC", // hash password123
         },
      ],
      skipDuplicates: true,
   });

   console.log("User seeded!");
}

main()
   .catch(e => console.error(e))
   .finally(async () => await prisma.$disconnect());
