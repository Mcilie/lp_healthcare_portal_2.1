import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserInfo = {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
};

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        setLoading(true);
        const response = await fetch('/api/user');
        
        if (response.status === 401) {
          // Unauthorized - redirect to login
          router.push('/login');
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          setUser({
            userId: data.userId || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            dateOfBirth: data.dateOfBirth || ''
          });
        } else {
          // Handle other errors
          console.error('Failed to fetch user info:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserInfo();
  }, [router]);

  return { user, loading };
} 