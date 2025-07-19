'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar({ activeChatId }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/chats');
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      const data = await response.json();
      setChats(data);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstMessage: '' }) // Initialize with empty message
      });
      const data = await response.json();
      router.push(`/chat/${data.id}`);
    } catch (err) {
      console.error('Error creating new chat:', err);
      setError('Failed to create new chat');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  };

  // Update chat titles when active chat changes
  useEffect(() => {
    fetchChats();
  }, [activeChatId]);

  return (
    <div className="w-64 bg-gray-50 h-full p-4 border-r flex flex-col">
      <button
        onClick={handleNewChat}
        className="w-full mb-4 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
      >
        + New Chat
      </button>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded text-sm">
          {error}
          <button 
            onClick={fetchChats}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-2 rounded bg-gray-200 animate-pulse h-16"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {chats.length === 0 ? (
              <div className="p-2 text-gray-500 text-center">
                Start a new chat to begin
              </div>
            ) : (
              chats.map(chat => (
                <Link 
                  href={`/chat/${chat.id}`} 
                  key={chat.id}
                  className={`block p-2 rounded transition-colors ${
                    activeChatId === chat.id.toString() 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium truncate">
                    {chat.title === 'New Chat' && chat.messages?.[0]?.content 
                      ? chat.messages[0].content.substring(0, 50) 
                      : chat.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(chat.created_at)}
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <div className="pt-4 border-t mt-auto">
        <div className="text-xs text-gray-500">
          {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}
        </div>
      </div>
    </div>
  );
}