'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/features/Navbar';
import { chatApi } from '@/lib/apiServices';
import { Send, MessageCircle } from 'lucide-react';

interface Conversation {
  _id: string;
  lastMessage: { text: string; senderId: string; receiverId: string; createdAt: string };
  unreadCount: number;
}

interface Message {
  _id: string;
  text: string;
  senderId: { _id: string; name: string } | string;
  createdAt: string;
}

function MessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const convoFromUrl = searchParams.get('convo');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(convoFromUrl);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await chatApi.getConversations(user.id) as Conversation[];
      setConversations(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [user?.id]);

  const loadMessages = useCallback(async () => {
    if (!activeConvo) return;
    try {
      const data = await chatApi.getMessages(activeConvo) as Message[];
      setMessages(data);
    } catch { /* ignore */ }
  }, [activeConvo]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (activeConvo) {
      loadMessages();
      // Poll every 2 seconds for "real-time" feel
      pollRef.current = setInterval(loadMessages, 2000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }
  }, [activeConvo, loadMessages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvo || sending) return;
    const convo = conversations.find(c => c._id === activeConvo);
    const receiverId = convo?.lastMessage.senderId === user?.id ? convo?.lastMessage.receiverId : convo?.lastMessage.senderId;
    if (!receiverId) return;

    setSending(true);
    try {
      await chatApi.send(activeConvo, receiverId, newMessage.trim());
      setNewMessage('');
      await loadMessages();
      loadConversations();
    } catch { alert('Failed to send'); }
    setSending(false);
  };

  const getSenderName = (msg: Message) => typeof msg.senderId === 'object' ? msg.senderId.name : (msg.senderId === user?.id ? 'You' : 'Other');
  const isMyMessage = (msg: Message) => (typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId) === user?.id;

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

        <div className="bg-white rounded-xl border overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
          <div className="border-r">
            <div className="p-4 border-b font-semibold text-gray-700">Conversations</div>
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500"><MessageCircle className="w-8 h-8 mx-auto mb-2" /><p>No conversations yet</p><p className="text-xs mt-2">Conversations are created when you interact on jobs</p></div>
            ) : (
              <div className="divide-y max-h-[450px] overflow-y-auto">
                {conversations.map(c => (
                  <button key={c._id} onClick={() => setActiveConvo(c._id)} className={`w-full p-4 text-left hover:bg-gray-50 ${activeConvo === c._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
                    <p className="font-medium truncate">{c.lastMessage?.text || 'No messages'}</p>
                    <p className="text-xs text-gray-500">{c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt).toLocaleString() : ''}</p>
                    {c.unreadCount > 0 && <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{c.unreadCount} new</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-2 flex flex-col">
            {!activeConvo ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">Select a conversation to start chatting</div>
            ) : (
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[400px] bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No messages yet. Send one!</div>
                  ) : messages.map(msg => (
                    <div key={msg._id} className={`flex ${isMyMessage(msg) ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl ${isMyMessage(msg) ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-900 border rounded-bl-sm'}`}>
                        <p className={`text-xs mb-1 ${isMyMessage(msg) ? 'text-blue-200' : 'text-gray-500'}`}>{getSenderName(msg)}</p>
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${isMyMessage(msg) ? 'text-blue-200' : 'text-gray-400'}`}>{new Date(msg.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t bg-white flex gap-2">
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 outline-none" disabled={sending} />
                  <button onClick={handleSend} disabled={sending || !newMessage.trim()} title="Send message" aria-label="Send message" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full"><Send className="w-5 h-5" /></button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (<ProtectedRoute><MessagesContent /></ProtectedRoute>);
}
