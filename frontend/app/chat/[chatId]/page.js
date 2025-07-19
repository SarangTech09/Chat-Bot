'use client';
import { useParams } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import ChatInterface from '../../components/ChatInterface';

export default function ChatPage() {
  const { chatId } = useParams();
  
  return (
    <div className="flex h-screen">
      <Sidebar activeChatId={chatId} />
      <ChatInterface chatId={chatId} />
    </div>
  );
}