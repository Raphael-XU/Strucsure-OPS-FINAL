import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, firstName, lastName, role = 'member') {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, {
        displayName: `${firstName} ${lastName}`
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        firstName,
        lastName,
        role,
        createdAt: new Date().toISOString(),
        profileComplete: false
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);

    // Get role from Firestore (simple approach)
    try {
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role || 'member');
      } else {
        // If user document doesn't exist, create it with default role
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          role: 'member',
          createdAt: new Date().toISOString()
        });
        setUserRole('member');
      }
    } catch (error) {
      console.warn('Unable to load user role:', error);
      setUserRole('member'); // Default to member
    }

    return result;
  }

  // Helper function to create/update user document in Firestore
  async function ensureUserDocument(user, additionalData = {}) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Extract name from displayName or split email
        const displayName = user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create new user document
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          firstName,
          lastName,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'member',
          createdAt: new Date().toISOString(),
          provider: user.providerData[0]?.providerId || 'unknown',
          ...additionalData
        });
      } else {
        // Update existing document with latest info
        await updateDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName || userDoc.data().displayName,
          photoURL: user.photoURL || userDoc.data().photoURL,
          lastLogin: new Date().toISOString(),
          ...additionalData
        });
      }

      // Get role from document
      const updatedDoc = await getDoc(doc(db, 'users', user.uid));
      if (updatedDoc.exists()) {
        setUserRole(updatedDoc.data().role || 'member');
      }
    } catch (error) {
      console.warn('Error ensuring user document:', error);
      setUserRole('member'); // Default to member
    }
  }

  // Google Sign In
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await ensureUserDocument(result.user);
      return result;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // Facebook Sign In
  async function signInWithFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      // Request email permission
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      await ensureUserDocument(result.user);
      return result;
    } catch (error) {
      console.error('Facebook sign in error:', error);
      throw error;
    }
  }

  // GitHub Sign In
  async function signInWithGithub() {
    try {
      const provider = new GithubAuthProvider();
      // Request email permission
      provider.addScope('user:email');
      const result = await signInWithPopup(auth, provider);
      await ensureUserDocument(result.user);
      return result;
    } catch (error) {
      console.error('GitHub sign in error:', error);
      throw error;
    }
  }

  function logout() {
    setUserRole(null);
    return signOut(auth);
  }

  async function updateUserRole(uid, newRole) {
    try {
      // Validate role
      const allowedRoles = ['member', 'executive', 'admin'];
      if (!allowedRoles.includes(newRole)) {
        throw new Error(`Invalid role. Must be one of: ${allowedRoles.join(', ')}`);
      }

      // Update role in Firestore (Firestore rules will verify admin permission)
      await updateDoc(doc(db, 'users', uid), {
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      // Log the change (optional - for audit trail)
      try {
        await setDoc(doc(db, 'roleAudit', `${uid}_${Date.now()}`), {
          targetUserId: uid,
          changedBy: currentUser?.uid,
          changedByEmail: currentUser?.email,
          newRole: newRole,
          timestamp: new Date().toISOString()
        });
      } catch (auditError) {
        // Don't fail if audit logging fails
        console.warn('Could not log role change:', auditError);
      }

      // Update local state if updating own role
      if (uid === currentUser?.uid) {
        setUserRole(newRole);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Get role from Firestore (simple approach)
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'member');
          } else {
            // Create user document if it doesn't exist
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: user.email,
              role: 'member',
              createdAt: new Date().toISOString()
            });
            setUserRole('member');
          }
        } catch (error) {
          console.warn('Error fetching user role:', error);
          setUserRole('member'); // Default to member
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    logout,
    updateUserRole,
    signInWithGoogle,
    signInWithFacebook,
    signInWithGithub
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
