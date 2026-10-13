import app from "./src/app.js";
import connectDB from "./src/config/database.js"

const startServer = async () => {
  await connectDB();

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Unable to start server:", error);
  process.exitCode = 1;
});
