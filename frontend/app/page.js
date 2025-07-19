'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const createNewChat = async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const { id } = await response.json();
        router.push(`/chat/${id}`);
      } catch (error) {
        console.error('Error creating chat:', error);
      }
    };
    createNewChat();
  }, [router]);

  return <div className="flex items-center justify-center h-screen">Loading...</div>;
}