import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

async function test() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Connected to MongoDB!");
    await client.close();
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

test();
