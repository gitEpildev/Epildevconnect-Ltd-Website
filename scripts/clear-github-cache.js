#!/usr/bin/env node

/**
 * Script to clear GitHub repos cache using the new /api/cache/clear endpoint
 * This forces the server to fetch fresh data from GitHub on the next request
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_PORT = process.env.BACKEND_PORT || 1600;
const CACHE_CLEAR_URL = `http://localhost:${BACKEND_PORT}/api/cache/clear`;
const REPOS_URL = `http://localhost:${BACKEND_PORT}/api/github/repos`;

console.log('\n🔄 Clearing GitHub repos cache...\n');

try {
  // Step 1: Clear the cache via API endpoint
  console.log('📤 Calling cache clear endpoint...');
  const clearResponse = await axios.post(CACHE_CLEAR_URL, null, {
    params: { pattern: 'github' },
    timeout: 10000
  });
  console.log(`✅ ${clearResponse.data.message}\n`);

  // Step 2: Fetch fresh repos data
  console.log('⏳ Fetching fresh GitHub repos data...\n');
  const response = await axios.get(REPOS_URL, {
    timeout: 60000 // Longer timeout for fresh fetch
  });

  const projects = response.data?.projects || [];
  console.log(`✅ Found ${projects.length} projects:\n`);
  
  projects.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.title}`);
    console.log(`      Tech: ${p.tech?.slice(0, 4).join(', ')}${p.tech?.length > 4 ? '...' : ''}`);
    console.log(`      Updated: ${new Date(p.updatedAt).toLocaleDateString()}`);
  });

  console.log('\n🎉 Cache cleared and fresh data fetched successfully!\n');

} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  if (error.response?.status === 404) {
    console.error('   The cache/clear endpoint may not be deployed yet.');
    console.error('   Restart the server after deploying the updated code.\n');
  }
  process.exit(1);
}


