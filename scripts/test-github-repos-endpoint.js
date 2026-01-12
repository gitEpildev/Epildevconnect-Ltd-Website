#!/usr/bin/env node

/**
 * Test script to verify GitHub repos endpoint and OpenAI integration
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_PORT = process.env.BACKEND_PORT || 1600;
const API_URL = `http://localhost:${BACKEND_PORT}/api/github/repos`;

console.log('\n🧪 Testing GitHub Repos Endpoint with OpenAI Integration\n');
console.log(`📍 Endpoint: ${API_URL}\n`);

try {
  console.log('⏳ Fetching projects...\n');
  const response = await axios.get(API_URL, {
    timeout: 30000, // 30 second timeout
  });

  const data = response.data;
  
  if (!data || !data.projects) {
    console.log('❌ Invalid response format');
    process.exit(1);
  }

  const projects = data.projects;
  console.log(`✅ Successfully fetched ${projects.length} projects\n`);

  // Check for Discord-Giveaway-BOT specifically
  const giveawayBot = projects.find(p => p.title?.includes('Discord Giveaway') || p.github?.includes('Discord-Giveaway-BOT'));
  
  if (giveawayBot) {
    console.log('📦 Discord-Giveaway-BOT Project:');
    console.log(`   Title: ${giveawayBot.title}`);
    console.log(`   Description: ${giveawayBot.description?.substring(0, 100)}...`);
    console.log(`   Tech: ${giveawayBot.tech?.join(', ') || 'None'}`);
    console.log(`   GitHub: ${giveawayBot.github}\n`);
  }

  // Show all projects
  console.log('📋 All Projects:\n');
  projects.forEach((project, index) => {
    const descPreview = project.description 
      ? (project.description.length > 60 ? project.description.substring(0, 60) + '...' : project.description)
      : '(no description)';
    
    console.log(`${index + 1}. ${project.title}`);
    console.log(`   ${descPreview}`);
    console.log(`   Tech: ${project.tech?.join(', ') || 'None'}\n`);
  });

  // Check for OpenAI-generated descriptions
  const hasDescriptions = projects.filter(p => p.description && p.description.length > 20).length;
  console.log(`\n📊 Summary:`);
  console.log(`   Total projects: ${projects.length}`);
  console.log(`   Projects with descriptions: ${hasDescriptions}`);
  console.log(`   Projects without descriptions: ${projects.length - hasDescriptions}\n`);

  console.log('✅ Test completed successfully!\n');

} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    console.error('❌ Could not connect to server');
    console.error('   → Make sure the server is running: npm run dev:backend\n');
  } else if (error.response) {
    console.error(`❌ Server error: ${error.response.status}`);
    console.error(`   ${error.response.data?.error || error.response.data?.message || 'Unknown error'}\n`);
  } else {
    console.error(`❌ Error: ${error.message}\n`);
  }
  process.exit(1);
}


