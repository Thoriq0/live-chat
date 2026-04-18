const bcrypt = require("bcryptjs");

const main = async () => {
   const hash = await bcrypt.hash("password123", 10);
   console.log(hash);
};

main();
