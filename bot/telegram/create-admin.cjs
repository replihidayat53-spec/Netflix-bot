#!/usr/bin/env node

/**
 * Create Admin User Script
 * Creates an admin user in Firebase Authentication and Firestore
 */

const admin = require('firebase-admin');
const readline = require('readline');
require('dotenv').config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = admin.auth();
const db = admin.firestore();

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminUser() {
  console.log('\n🔐 Create Admin User for Netflix Bot Dashboard\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Get user input
    const email = await question('📧 Enter admin email: ');
    const password = await question('🔑 Enter admin password (min 6 characters): ');
    const displayName = await question('👤 Enter admin display name (optional): ');

    if (!email || !password) {
      console.error('\n❌ Email and password are required!');
      rl.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('\n❌ Password must be at least 6 characters!');
      rl.close();
      process.exit(1);
    }

    console.log('\n⏳ Creating admin user...\n');

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: displayName || 'Admin',
      emailVerified: true,
    });

    console.log(`✅ User created in Firebase Auth`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);

    // Create admin document in Firestore
    await db.collection('admins').doc(userRecord.uid).set({
      email: email,
      role: 'admin',
      displayName: displayName || 'Admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Admin document created in Firestore`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Admin user created successfully!\n');
    console.log('📝 Login Credentials:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n🌐 Dashboard URL: http://localhost:3000');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n💡 This email is already registered.');
      console.log('   Try logging in with your existing credentials.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n💡 Please provide a valid email address.');
    } else if (error.code === 'auth/weak-password') {
      console.log('\n💡 Password should be at least 6 characters.');
    }
    
    rl.close();
    process.exit(1);
  }
  
  rl.close();
  process.exit(0);
}

// Run the script
createAdminUser();
