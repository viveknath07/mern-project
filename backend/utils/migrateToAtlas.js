/**
 * One-time migration script
 * Copies customers from local MongoDB (localhost:27017/shopkart)
 * into MongoDB Atlas (from MONGO_URI in .env)
 *
 * Run once with:  node utils/migrateToAtlas.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const LOCAL_URI = "mongodb://localhost:27017/shopkart";
const ATLAS_URI = process.env.MONGO_URI;

if (!ATLAS_URI || ATLAS_URI.includes("localhost")) {
  console.error("❌ MONGO_URI in .env does not look like an Atlas URI. Aborting.");
  process.exit(1);
}

console.log("🔗 Connecting to LOCAL MongoDB...");
const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();

console.log("🔗 Connecting to ATLAS MongoDB...");
const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();

const localCustomers = localConn.db.collection("customers");
const atlasCustomers = atlasConn.db.collection("customers");

// Fetch all customers from local
const customers = await localCustomers.find({}).toArray();
console.log(`\n📋 Found ${customers.length} customers in local MongoDB:`);
customers.forEach(c => console.log(`   - ${c.fullName} (${c.email})`));

if (customers.length === 0) {
  console.log("Nothing to migrate.");
  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

// Check which ones already exist in Atlas (by email) to avoid duplicates
let migrated = 0;
let skipped = 0;

for (const customer of customers) {
  const exists = await atlasCustomers.findOne({ email: customer.email });
  if (exists) {
    console.log(`   ⏭️  Skipping ${customer.email} (already in Atlas)`);
    skipped++;
  } else {
    await atlasCustomers.insertOne(customer);
    console.log(`   ✅ Migrated: ${customer.fullName} (${customer.email})`);
    migrated++;
  }
}

console.log(`\n🎉 Migration complete!`);
console.log(`   ✅ Migrated : ${migrated} customers`);
console.log(`   ⏭️  Skipped  : ${skipped} (already existed in Atlas)`);
console.log(`\nNow go to Atlas → shopkart → customers to see your data.`);

await localConn.close();
await atlasConn.close();
