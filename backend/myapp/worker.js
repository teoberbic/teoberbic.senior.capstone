import 'dotenv/config';
import cron from 'node-cron';
import mongoose from 'mongoose';
import runIngestion from './jobs/scrape.js'; 

const MONGO = process.env.MONGODB_URI;
let isRunning = false; // simple reentry guard

async function connect() {
  if (mongoose.connection.readyState !== 1) await mongoose.connect(MONGO);
}

// run at minute 5 every hour, use America/New_York
cron.schedule('5 * * * *', async () => {
  if (isRunning) return;
  isRunning = true;
  try {
    await connect();
    await runIngestion();
  } catch (e) {
    console.error('cron error:', e);
  } finally {
    isRunning = false;
  }
}, { timezone: 'America/New_York' });

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});

console.log('Cron worker started');
