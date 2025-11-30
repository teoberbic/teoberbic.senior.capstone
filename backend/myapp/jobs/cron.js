
/**
 * cron job that scrapes all brands once a day
 * 
 * **/

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const cron = require('node-cron');
const { scrapeAllBrandsOnce } = require('./scraper');

async function connectDb() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || 'sscd' });
}

async function runJob() {
  await connectDb();
  return await scrapeAllBrandsOnce();
}

// run every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Cron: starting scrapeAllBrandsOnce');
  runJob()
    .then(results => {
      console.log('Cron finished. Results:', JSON.stringify(results, null, 2));
    })
    .catch(err => console.error('Cron error:', err));
});


// run immediately once when file is ran in terminal manually
if (require.main === module) {
  runJob().then(() => console.log('Manual run in terminal finished'));
}
