const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There isn't a direct listModels in the current typical version of the web SDK easily accessible this way, 
    // but we can try to initialize one and see if it fails immediately.
    const modelName = process.env.GEMINI_MODEL;
    if (!modelName) {
      console.error("GEMINI_MODEL not found in .env");
      return;
    }
    console.log("Testing Gemini Model:", modelName);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("test");
    console.log(`SUCCESS with ${modelName}`);
  } catch (e) {
    console.error(`FAILED with ${process.env.GEMINI_MODEL}:`, e.message);
  }
}

listModels();
