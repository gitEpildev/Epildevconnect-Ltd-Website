#!/usr/bin/env node

/**
 * Quick verification script for OpenAI integration setup
 */

import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔍 Verifying OpenAI Integration Setup...\n');

// Check API key
const hasApiKey = !!process.env.OPENAI_API_KEY;
console.log(`✅ API Key: ${hasApiKey ? 'Set (' + process.env.OPENAI_API_KEY.substring(0, 7) + '...)' : '❌ Not set'}`);

if (!hasApiKey) {
  console.log('\n❌ OPENAI_API_KEY not found in .env file');
  console.log('   → Add it to your .env file: OPENAI_API_KEY=sk-...\n');
  process.exit(1);
}

// Check if openai package is installed
try {
  const openaiPkg = await import('openai');
  console.log('✅ OpenAI package: Installed');
} catch (error) {
  console.log('❌ OpenAI package: Not installed');
  console.log('   → Run: npm install\n');
  process.exit(1);
}

// Check database connection (optional)
try {
  const { pool } = await import('../server/db.js');
  const client = await pool.connect();
  client.release();
  console.log('✅ Database: Connected');
} catch (error) {
  console.log('⚠️  Database: Could not verify (server may not be running)');
}

console.log('\n✅ Setup verification complete!\n');
console.log('📋 Next Steps:');
console.log('   1. Start your server:');
console.log('      npm run dev:backend    (development with auto-reload)');
console.log('      npm start              (production)\n');
console.log('   2. The database will automatically create the project_descriptions table');
console.log('      on first server start\n');
console.log('   3. When you visit /api/github/repos (or the Projects page), the system will:');
console.log('      • Check each repo for missing/placeholder descriptions');
console.log('      • Generate descriptions using OpenAI (if needed)');
console.log('      • Cache them in PostgreSQL for future requests\n');
console.log('   4. Descriptions are only generated when:');
console.log('      • GitHub description is missing/empty');
console.log('      • Description is placeholder text');
console.log('      • Repo is explicitly flagged for regeneration\n');
console.log('💡 Tip: Check server logs to see description generation in action!\n');


