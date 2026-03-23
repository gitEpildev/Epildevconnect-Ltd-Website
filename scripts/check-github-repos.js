#!/usr/bin/env node

/**
 * Script to check GitHub repositories and display which ones will appear in the portfolio.
 * 
 * NEW BEHAVIOR (after whitelist removal):
 * - ALL non-archived, non-fork, public repos are automatically included
 * - To EXCLUDE a repo: add 'no-portfolio' topic on GitHub
 * - To INCLUDE a fork: add 'portfolio' topic on GitHub
 * 
 * The hardcoded whitelist is NO LONGER REQUIRED for new repos.
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const githubUsername = process.env.GITHUB_USERNAME || 'gitEpildev';
const githubToken = process.env.GITHUB_TOKEN;

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'MY-HUB-Dashboard/1.0'
};

if (githubToken) {
  headers['Authorization'] = `token ${githubToken}`;
}

// NOTE: Whitelist is no longer used! All non-archived, non-fork repos are automatically included.
// To exclude a repo: add 'no-portfolio' topic on GitHub
// To include a fork: add 'portfolio' topic on GitHub
const legacyWhitelist = [
  'MyLink',
  '8bp-rewards-4.3.2',
  '8bp-rewards-5.0-Public',
  '8bp-rewards-5.2-Public',
  '8bp-rewards',
  'myhub',
  'BTD6-Auto-Assign',
  'Discord-Giveaway-BOT',
];

async function checkRepos() {
  try {
    console.log(`\n🔍 Checking repositories for ${githubUsername}...\n`);
    
    // Fetch all public repositories
    const response = await axios.get(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100&type=public`,
      { headers }
    );
    
    const repos = response.data || [];
    console.log(`📦 Found ${repos.length} public repositories\n`);
    
    // Fetch topics for each repo
    const reposWithTopics = await Promise.all(
      repos.map(async (repo, index) => {
        if (index > 0 && index % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        try {
          const topicsResponse = await axios.get(
            `https://api.github.com/repos/${githubUsername}/${repo.name}/topics`,
            { 
              headers: {
                ...headers,
                'Accept': 'application/vnd.github.mercy-preview+json'
              }
            }
          );
          repo.topics = topicsResponse.data?.names || [];
        } catch (err) {
          repo.topics = [];
        }
        
        return repo;
      })
    );
    
    // Categorize repos
    const portfolioTagged = reposWithTopics.filter(r => r.topics?.includes('portfolio'));
    const whitelisted = reposWithTopics.filter(r => legacyWhitelist.includes(r.name));
    const eligible = reposWithTopics.filter(r => 
      !r.archived && 
      !r.fork && 
      !portfolioTagged.includes(r) && 
      !whitelisted.includes(r)
    );
    
    console.log('📊 Repository Summary:\n');
    console.log(`✅ Portfolio-tagged: ${portfolioTagged.length}`);
    portfolioTagged.forEach(r => {
      console.log(`   - ${r.name} (${r.stargazers_count} stars, updated: ${new Date(r.updated_at).toLocaleDateString()})`);
    });
    
    console.log(`\n✅ Whitelisted: ${whitelisted.length}`);
    whitelisted.forEach(r => {
      console.log(`   - ${r.name} (${r.stargazers_count} stars, updated: ${new Date(r.updated_at).toLocaleDateString()})`);
    });
    
    console.log(`\n🔍 Eligible for whitelist (not archived, not fork, no portfolio tag): ${eligible.length}`);
    if (eligible.length > 0) {
      console.log('\n   Consider adding these to the whitelist:');
      eligible
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .forEach(r => {
          const desc = r.description ? ` - ${r.description.substring(0, 60)}...` : '';
          console.log(`   - ${r.name}${desc}`);
          console.log(`     Stars: ${r.stargazers_count}, Forks: ${r.forks_count}, Updated: ${new Date(r.updated_at).toLocaleDateString()}`);
        });
    }
    
    console.log(`\n❌ Excluded (archived or forks): ${reposWithTopics.length - portfolioTagged.length - whitelisted.length - eligible.length}\n`);
    
  } catch (error) {
    console.error('❌ Error fetching repositories:', error.message);
    if (error.response?.status === 403 || error.response?.status === 429) {
      console.error('   Rate limit exceeded. Consider setting GITHUB_TOKEN in .env');
    }
    process.exit(1);
  }
}

checkRepos();


