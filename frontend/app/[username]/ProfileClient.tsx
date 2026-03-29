'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { postMessage, recordLinkClick, recordProfileView } from '@/api/linkfolioApi';

type ProfileUser = {
  displayName: string;
  bio: string;
  avatarUrl: string;
  username: string;
  views: number;
  theme?: string;
};

type ProfileLink = {
  _id: string;
  title: string;
  url: string;
  enabled: boolean;
  clicks: number;
};

type ProfileClientProps = {
  user: ProfileUser;
  links: ProfileLink[];
};

export default function ProfileClient({ user, links }: ProfileClientProps) {
  const [content, setContent] = useState('');
  const [messageStatus, setMessageStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void recordProfileView(user.username);
  }, [user.username]);

  const displayName = user.displayName || user.username;
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'U';

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();

    if (!trimmed || trimmed.length > 60) {
      setMessageStatus('Message must be between 1 and 60 characters.');
      return;
    }

    try {
      setSending(true);
      await postMessage(user.username, trimmed);
      setContent('');
      setMessageStatus('Message sent!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send message.';
      setMessageStatus(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] px-4 py-10">
      <div className="max-w-md mx-auto text-center">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={displayName}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#ec5c33]/15 text-[#ec5c33] font-bold text-3xl flex items-center justify-center mx-auto mb-4">
            {avatarLetter}
          </div>
        )}

        <h1 className="text-3xl font-bold text-black">{displayName}</h1>
        <p className="text-[#888888] mt-1">@{user.username}</p>
        {user.bio ? (
          <p className="text-[#504d46] mt-3 leading-relaxed">{user.bio}</p>
        ) : null}

        <div className="mt-8 space-y-3 text-left">
          {links.length === 0 ? (
            <p className="text-sm text-[#888888] text-center border border-dashed border-gray-300 rounded-xl py-4">
              No links yet.
            </p>
          ) : null}
          {links.map((link) => (
            <button
              key={link._id}
              className="w-full text-left bg-white rounded-xl border border-[#ec5c33]/25 px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#ec5c33] transition-all"
              onClick={() => {
                void recordLinkClick(link._id, user.username);
                window.open(link.url, '_blank', 'noopener,noreferrer');
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-black">{link.title}</span>
                <span className="text-xs text-[#888888]">Visit ↗</span>
              </div>
            </button>
          ))}
        </div>

        <section className="mt-8 text-left bg-white rounded-xl border border-[#ec5c33]/25 p-4">
          <h2 className="text-lg font-semibold text-black mb-3">Leave a message</h2>
          <form onSubmit={handleSendMessage} className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => {
                if (e.target.value.length <= 60) {
                  setContent(e.target.value);
                }
              }}
              maxLength={60}
              rows={3}
              placeholder="Write a short message..."
              className="w-full rounded-lg border border-[#ec5c33]/30 px-3 py-2 outline-none focus:ring-2 focus:ring-[#ec5c33]/30"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">{content.length}/60</span>
              <button
                type="submit"
                disabled={sending}
                className="px-4 py-2 rounded-lg bg-[#ec5c33] text-white font-medium hover:bg-[#d54a29] disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
          {messageStatus ? (
            <p
              className={`mt-2 text-sm ${
                messageStatus === 'Message sent!'
                  ? 'text-green-600'
                  : 'text-[#504d46]'
              }`}
            >
              {messageStatus}
            </p>
          ) : null}
        </section>

        <footer className="mt-8 text-center text-xs text-[#888888]">
          <Link href="/" className="hover:text-[#ec5c33] transition-colors">
            Powered by LinkFolio
          </Link>
        </footer>
      </div>
    </div>
  );
}
