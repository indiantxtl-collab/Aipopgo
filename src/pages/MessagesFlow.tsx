import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { ChevronLeft, Send, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export function MessagesList() {
  const { currentUser, systemData } = useAuth();
  const navigate = useNavigate();

  if (!currentUser || !systemData) return null;

  // We group messages by user pair to find conversations
  const conversations = new Map();
  systemData.messages.forEach(m => {
     if (m.conversationId === 'global') return;
     const [id1, id2] = m.conversationId.split('_');
     if (id1 !== currentUser.id && id2 !== currentUser.id) return;
     const otherId = id1 === currentUser.id ? id2 : id1;
     
     if (!conversations.has(otherId) || new Date(conversations.get(otherId).timestamp) < new Date(m.timestamp)) {
        conversations.set(otherId, m);
     }
  });

  const followingIds = systemData.follows.filter(f => f.followerId === currentUser.id).map(f => f.followingId);
  const possiblePeers = Array.from(new Set([...Array.from(conversations.keys()), ...followingIds]));

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-slate-50 pb-24 relative max-w-md mx-auto">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 mb-4">
         <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight">Messages</h1>
      </div>
      
      <div className="px-4 space-y-3">
         {possiblePeers.map(peerId => {
            const peer = systemData.users.find(u => u.id === peerId);
            if (!peer) return null;
            const lastMsg = conversations.get(peerId);

            return (
              <motion.div 
                 whileTap={{scale:0.98}} 
                 onClick={() => navigate(`/messages/new/${peer.id}`)}
                 key={peer.id} 
                 className="glass-card p-4 rounded-3xl flex items-center gap-4 cursor-pointer shadow-sm border border-white relative group"
              >
                 <div className="relative">
                   <img src={peer.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${peer.username}&backgroundColor=fbcfe8`} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                   {peer.isVerified && <VerifiedBadge isGolden={peer.id === '100000'} size={14} className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />}
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-[15px] text-slate-900 truncate">{peer.name}</p>
                      {lastMsg && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDistanceToNow(new Date(lastMsg.timestamp)).replace('about ','')}</span>}
                    </div>
                    {lastMsg ? (
                      <p className="text-sm text-slate-500 truncate font-medium">{lastMsg.senderId === currentUser.id ? 'You: ' : ''}{lastMsg.text}</p>
                    ) : (
                      <p className="text-sm text-pink-400 truncate font-bold flex items-center gap-1"><Sparkles className="w-3 h-3"/> Start chatting</p>
                    )}
                 </div>
              </motion.div>
            )
         })}

         {possiblePeers.length === 0 && (
            <div className="text-center py-20 text-slate-500 font-medium px-8">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                 <Sparkles className="w-8 h-8 text-pink-300" />
               </div>
               No messages yet. Follow someone to start a conversation!
            </div>
         )}
      </div>
    </div>
  );
}

export function MessageThread() {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser, systemData } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const conversationId = currentUser && userId ? [currentUser.id, userId].sort().join('_') : '';

  useEffect(() => {
    if (!conversationId || !currentUser || !userId) return;

    // Initial fetch
    api.getMessages(conversationId).then(setMessages);

    // Supabase Realtime Subscription
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversationId=eq.${conversationId}` }, payload => {
         setMessages(prev => {
           if (prev.some(m => m.id === payload.new.id)) return prev;
           return [...prev, payload.new];
         });
      })
      .on('broadcast', { event: 'typing' }, payload => {
         if (payload.payload.senderId === userId) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 2000);
         }
      })
      .subscribe();

    return () => {
       supabase.removeChannel(channel);
    };
  }, [currentUser?.id, conversationId, userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [messages]);

  if (!currentUser || !systemData || !userId) return null;
  const peer = systemData.users.find(u => u.id === userId);
  if (!peer) return <div className="p-10">User not found</div>;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (peer.isPrivate) {
       const isFollowing = systemData.follows.some(f => f.followerId === currentUser.id && f.followingId === peer.id);
       if (!isFollowing) {
           toast.error("You must follow this private account to send messages");
           return;
       }
    }

    try {
      const sentText = text;
      setText('');
      await api.sendMessage(currentUser.id, conversationId, sentText);
    } catch(err) {}
  };

  const handleTyping = () => {
    supabase.channel(`chat_${conversationId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { senderId: currentUser.id }
    });
  };

  return (
    <div className="w-full bg-slate-50 h-[100dvh] flex flex-col relative max-w-md mx-auto">
      <div className="flex-shrink-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
           <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
             <ChevronLeft className="w-6 h-6 text-slate-600" />
           </button>
           <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/u/${peer.username}`)}>
             <img src={peer.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${peer.username}&backgroundColor=fbcfe8`} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
             <div className="flex flex-col">
               <h2 className="font-bold text-slate-900 text-[14px] leading-tight flex items-center gap-1">
                 {peer.name} {peer.isVerified && <VerifiedBadge isGolden={peer.id === '100000'} size={12} />}
               </h2>
               {isTyping ? (
                 <span className="text-[10px] text-pink-500 font-bold tracking-widest italic animate-pulse">typing...</span>
               ) : (
                 <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest">Active</span>
               )}
             </div>
           </div>
         </div>
      </div>
      
      <div className="flex-[1] overflow-y-auto p-4 space-y-4 flex flex-col">
         {messages.length === 0 && (
           <div className="text-center py-10 flex flex-col items-center flex-1 justify-center">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <img src={peer.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${peer.username}&backgroundColor=fbcfe8`} className="w-full h-full rounded-full object-cover" />
             </div>
             <h3 className="font-bold text-slate-800 text-lg">{peer.name}</h3>
             <p className="text-slate-400 text-sm mt-1">Say hi!</p>
           </div>
         )}
         {messages.map(m => {
            const isMe = m.senderId === currentUser.id;
            return (
              <div key={m.id} className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                <div className={`px-4 py-3 rounded-[1.5rem] text-[15px] font-medium leading-relaxed shadow-sm ${
                  isMe ? 'bg-gradient-to-tr from-pink-500 to-orange-400 text-white rounded-br-[4px]' : 'bg-white text-slate-800 rounded-bl-[4px] border border-slate-100'
                }`}>
                  {m.text}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                  {isMe ? 'Sent' : formatDistanceToNow(new Date(m.timestamp))}
                </div>
              </div>
            )
         })}
         <div ref={endRef} />
      </div>

      <div className="flex-shrink-0 p-3 bg-white/90 backdrop-blur-xl border-t border-slate-100 pb-safe z-30 max-w-md mx-auto w-full">
         <form onSubmit={handleSend} className="flex gap-2 items-center">
            <button type="button" className="p-2 text-slate-400 hover:text-pink-500 transition-colors">
              <ImageIcon className="w-6 h-6" />
            </button>
            <input 
              value={text} onChange={e => {
                setText(e.target.value);
                handleTyping();
              }}
              placeholder="Message..." 
              className="flex-1 bg-slate-100/50 rounded-full px-5 py-3 border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all shadow-inner placeholder-slate-400"
            />
            <motion.button 
              whileTap={{ scale: 0.9 }}
              type="submit" 
              disabled={!text.trim()} 
              className="bg-slate-900 text-white rounded-full p-2 w-[44px] h-[44px] flex items-center justify-center disabled:opacity-50 shadow-md transition-all"
            >
               <Send className="w-5 h-5 ml-[-2px]" />
            </motion.button>
         </form>
      </div>
    </div>
  );
}
