const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function to set user role (admin only)
 * This function sets both the custom claim and updates Firestore
 * 
 * @param {string} data.uid - User ID to update
 * @param {string} data.role - Role to assign ('member', 'executive', or 'admin')
 * @returns {Object} Success status
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function.'
    );
  }

  // Check if user is admin
  const callerDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const callerRole = callerDoc.exists ? callerDoc.data().role : 'member';
  
  if (callerRole !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only administrators can change user roles.'
    );
  }

  // Validate input
  const { uid, role } = data;
  if (!uid || !role) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Both uid and role are required.'
    );
  }

  const allowedRoles = ['member', 'executive', 'admin'];
  if (!allowedRoles.includes(role)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Role must be one of: ${allowedRoles.join(', ')}`
    );
  }

  try {
    // Set custom claim
    await admin.auth().setCustomUserClaims(uid, { role });

    // Update Firestore user document
    await admin.firestore().collection('users').doc(uid).set(
      { role, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    // Log the role change for audit
    await admin.firestore().collection('roleAudit').add({
      targetUserId: uid,
      changedBy: context.auth.uid,
      changedByEmail: context.auth.token.email,
      oldRole: (await admin.firestore().collection('users').doc(uid).get()).data()?.role || 'unknown',
      newRole: role,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { 
      success: true, 
      message: `User role updated to ${role}` 
    };
  } catch (error) {
    console.error('Error setting user role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update user role.',
      error.message
    );
  }
});

/**
 * Cloud Function to get all users (admin only)
 * This is a helper function for admin panel
 */
exports.getUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const callerDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const callerRole = callerDoc.exists ? callerDoc.data().role : 'member';
  
  if (callerRole !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only administrators can view all users.');
  }

  try {
    const usersSnapshot = await admin.firestore().collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      users.push({
        uid: doc.id,
        ...doc.data()
      });
    });

    return { users };
  } catch (error) {
    console.error('Error getting users:', error);
    throw new functions.https.HttpsError('internal', 'Failed to retrieve users.');
  }
});

/**
 * Cloud Function to create a new user (admin only)
 * This function creates a user in Firebase Auth and Firestore
 *
 * @param {Object} data - User data
 * @param {string} data.email - User email
 * @param {string} data.firstName - User first name
 * @param {string} data.lastName - User last name
 * @param {string} data.role - User role ('member', 'executive', or 'admin')
 * @param {string} data.department - User department (optional)
 * @param {string} data.location - User location (optional)
 * @returns {Object} Created user data
 */
exports.createUser = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function.'
    );
  }

  // Check if user is admin
  const callerDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const callerRole = callerDoc.exists ? callerDoc.data().role : 'member';

  if (callerRole !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only administrators can create users.'
    );
  }

  // Validate input
  const { email, firstName, lastName, role, department, location } = data;
  if (!email || !firstName || !lastName || !role) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email, firstName, lastName, and role are required.'
    );
  }

  const allowedRoles = ['member', 'executive', 'admin'];
  if (!allowedRoles.includes(role)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Role must be one of: ${allowedRoles.join(', ')}`
    );
  }

  try {
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'Temp!';

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: tempPassword,
      displayName: `${firstName} ${lastName}`,
      emailVerified: false,
    });

    // Set custom claim for role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // Create user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: role,
      department: department || '',
      location: location || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      profileComplete: false
    });

    // Log the user creation for audit
    await admin.firestore().collection('systemLogs').add({
      type: 'user_created',
      action: `User ${firstName} ${lastName} (${email}) created`,
      userId: userRecord.uid,
      userEmail: email,
      changedBy: context.auth.uid,
      changedByEmail: context.auth.token.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        firstName,
        lastName,
        role,
        department,
        location
      }
    });

    return {
      success: true,
      user: {
        uid: userRecord.uid,
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: role,
        department: department || '',
        location: location || '',
        createdAt: new Date().toISOString()
      },
      tempPassword: tempPassword // Return temp password so admin can share it
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create user.',
      error.message
    );
  }
});
