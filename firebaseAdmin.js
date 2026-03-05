const admin = require('firebase-admin')

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountJson) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please set it in .env or your hosting environment.')
  process.exit(1)
}

// if (!databaseURL) {
//   console.error('DATABASE_URL environment variable is not set. Please set it in .env or your hosting environment.')
//   process.exit(1)
// }

let serviceAccount

try {
  serviceAccount = JSON.parse(serviceAccountJson)

} catch (error) {
  console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is valid JSON:', error)
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tentrio-firebasis-default-rtdb.europe-west1.firebasedatabase.app/"
})

const db = admin.database();

module.exports = { db, admin };
