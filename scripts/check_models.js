const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There isn't a direct listModels in the current typical version of the web SDK easily accessible this way, 
    // but we can try to initialize one and see if it fails immediately.
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });
    const result = await model.generateContent("test");
    console.log("SUCCESS with gemini-3-flash");
  } catch (e) {
    console.error("FAILED with gemini-3-flash:", e.message);
  }
}

listModels();
