'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase/provider';
import { onAuthStateChanged, type User } from 'firebase/auth';

/**
 * Custom hook to get the current authenticated user from Firebase.
 *
 * This hook abstracts away the onAuthStateChanged listener and provides
 * a simple way to access the user object, loading state, and any errors.
 *
 * @returns An object containing:
 *  - `user`: The Firebase User object if authenticated, otherwise null.
 *  - `isUserLoading`: A boolean indicating if the initial auth state is being determined.
 *  - `userError`: An Error object if the auth state listener fails.
 */
export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setIsUserLoading(false);
      },
      (error) => {
        console.error('Firebase auth state error:', error);
        setUserError(error);
        setIsUserLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Re-run effect if the auth instance changes

  return { user, isUserLoading, userError };
}
