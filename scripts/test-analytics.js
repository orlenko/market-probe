const { db } = require('../src/lib/db.ts');

async function testAnalytics() {
  try {
    console.log('🔍 Testing analytics functions...');

    // Test getAllProjectsStats
    console.log('\n📊 Testing getAllProjectsStats...');
    const projects = await db.analytics.getAllProjectsStats(30);
    console.log('Projects found:', projects.length);
    projects.forEach(p => {
      console.log(`- ${p.title}: ${p.pageViews} views, ${p.formSubmissions} submissions`);
    });

    if (projects.length > 0) {
      console.log('\n📈 Testing getDetailedStats for first project...');
      const detailed = await db.analytics.getDetailedStats(projects[0].id, 30);
      console.log('Detailed stats:', {
        pageViews: detailed.summary.pageViews,
        submissions: detailed.summary.formSubmissions,
        conversionRate: detailed.summary.conversionRate.toFixed(2) + '%',
        timeSeriesEntries: detailed.timeSeries.pageViews.length,
        utmSources: detailed.sources.utm.length,
        referrers: detailed.sources.referrers.length
      });
    }

    console.log('\n✅ Analytics functions working correctly!');
  } catch (error) {
    console.error('❌ Analytics test failed:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testAnalytics();
