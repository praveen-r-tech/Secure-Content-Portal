const mongoose = require('mongoose');
const dns = require('dns');

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to server/.env');
  }

  // Ensure DNS SRV lookups work reliably on Windows and diverse ISP networks.
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (dnsErr) {
    console.warn('Unable to set custom DNS servers:', dnsErr.message);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
}

module.exports = { connectDB };