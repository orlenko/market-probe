#!/usr/bin/env node

// Simple test script to verify our MarketProbe 2.0 APIs
// Run with: node scripts/test-api.js

const BASE_URL = 'http://localhost:3000';

async function testAPI(endpoint, options = {}) {
  try {
    console.log(`🧪 Testing ${options.method || 'GET'} ${endpoint}`);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Success (${response.status}):`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Error (${response.status}):`, JSON.stringify(data, null, 2));
    }

    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log(`💥 Network Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting MarketProbe 2.0 API Tests\n');

  // Test 1: Check if server is running by testing analytics endpoint
  console.log('📊 Testing Analytics API');
  await testAPI('/api/analytics?slug=ai-writing-assistant&days=7');
  console.log('');

  // Test 2: Test form submission
  console.log('📝 Testing Form Submission API');
  const formData = {
    formData: {
      email: 'test@example.com',
      name: 'Test User',
      message: 'This is a test submission from the API test script',
    },
    utmSource: 'test',
    utmMedium: 'api-test',
    utmCampaign: 'automated-testing',
  };

  await testAPI('/api/form/ai-writing-assistant', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  console.log('');

  // Test 3: Test analytics tracking
  console.log('📈 Testing Analytics Tracking API');
  const analyticsData = {
    slug: 'ai-writing-assistant',
    eventType: 'PAGE_VIEW',
    pathname: '/p/ai-writing-assistant',
    metadata: {
      test: true,
      source: 'api-test-script',
    },
  };

  await testAPI('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(analyticsData),
  });
  console.log('');

  // Test 4: Test projects API
  console.log('🗂️ Testing Projects API');
  await testAPI('/api/projects?limit=5');
  console.log('');

  console.log('🎉 API Testing Complete!');
  console.log('');
  console.log('💡 To test manually:');
  console.log('1. Start the dev server: npm run dev');
  console.log('2. Visit: http://localhost:3000');
  console.log('3. Check Prisma Studio: npm run db:studio');
  console.log('4. View sample projects:');
  console.log('   - http://localhost:3000/p/ai-writing-assistant');
  console.log('   - http://localhost:3000/p/eco-friendly-packaging');
}

// Check if this script is being run directly
if (process.argv[1].endsWith('test-api.js')) {
  runTests().catch(console.error);
}

module.exports = { testAPI, runTests };
