'use strict';

/**
 * Check a user's skills and AI resume data in the database.
 * Usage: node scripts/check-user.js [email]
 * Default email: test@vcet.edu.in
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const email = process.argv[2] || 'test@vcet.edu.in';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('../src/models/User');

  const user = await User.findOne({ email }).select('name email role skills resumeUrl resumeData');

  if (!user) {
    console.log(`\n❌  No user found with email: ${email}`);
    process.exit(0);
  }

  console.log('\n───────────────────────────────────────');
  console.log(`👤  ${user.name}  (${user.role})`);
  console.log(`📧  ${user.email}`);
  console.log('───────────────────────────────────────');

  console.log('\n📄  resumeUrl:');
  console.log(' ', user.resumeUrl || '(none)');

  console.log('\n🛠️  skills (profile):');
  console.log(' ', user.skills.length ? user.skills.join(', ') : '(empty)');

  console.log('\n🤖  resumeData.extractedAt:');
  console.log(' ', user.resumeData?.extractedAt || '(not extracted yet)');

  console.log('\n🤖  resumeData.skills:');
  const rs = user.resumeData?.skills || [];
  console.log(' ', rs.length ? rs.join(', ') : '(empty)');

  console.log('\n🤖  resumeData.summary:');
  console.log(' ', user.resumeData?.summary || '(none)');

  console.log('\n🎓  resumeData.education:');
  const edu = user.resumeData?.education || [];
  if (edu.length) {
    edu.forEach((e) => console.log(`  • ${e.institution} — ${e.degree} (${e.year})`));
  } else {
    console.log('  (none)');
  }

  console.log('\n💼  resumeData.experience:');
  const exp = user.resumeData?.experience || [];
  if (exp.length) {
    exp.forEach((e) => console.log(`  • ${e.role} @ ${e.company} (${e.duration})`));
  } else {
    console.log('  (none)');
  }

  console.log('\n───────────────────────────────────────\n');
  process.exit(0);
}).catch((err) => {
  console.error('DB connection error:', err.message);
  process.exit(1);
});
