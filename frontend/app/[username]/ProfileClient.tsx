'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { postMessage, recordLinkClick, recordProfileView } from '@/api/linkfolioApi';
import { getTheme } from '@/lib/themes';

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
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    void recordProfileView(user.username);
  }, [user.username]);

  const displayName = user.displayName || user.username;
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'U';
  const theme = getTheme(user.theme || 'default');
  const themeStyle = Object.fromEntries(Object.entries(theme.vars)) as CSSProperties;

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
    <div
      style={{
        ...themeStyle,
        backgroundColor: 'var(--lf-bg)',
        fontFamily: 'var(--lf-font)',
        minHeight: '100vh',
      }}
      className="px-4 py-10"
    >
      <div className="max-w-md mx-auto text-center">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={displayName}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full font-bold text-3xl flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: 'var(--lf-card-bg)',
              color: 'var(--lf-accent)',
            }}
          >
            {avatarLetter}
          </div>
        )}

        <h1 className="text-3xl font-bold" style={{ color: 'var(--lf-name-color)' }}>
          {displayName}
        </h1>
        <p className="mt-1" style={{ color: 'var(--lf-text-secondary)' }}>
          @{user.username}
        </p>
        {user.bio ? (
          <p className="mt-3 leading-relaxed" style={{ color: 'var(--lf-text-secondary)' }}>
            {user.bio}
          </p>
        ) : null}

        <div className="mt-8 space-y-3 text-left">
          {links.length === 0 ? (
            <p
              className="text-sm text-center border border-dashed py-4"
              style={{
                color: 'var(--lf-text-secondary)',
                borderColor: 'var(--lf-card-border)',
                borderRadius: 'var(--lf-radius)',
              }}
            >
              No links yet.
            </p>
          ) : null}
          {links.map((link) => (
            <button
              key={link._id}
              className="w-full text-left border px-4 py-3 hover:-translate-y-0.5 transition-all"
              style={{
                backgroundColor:
                  hoveredLink === link._id
                    ? 'var(--lf-card-hover)'
                    : 'var(--lf-card-bg)',
                border: '1px solid var(--lf-card-border)',
                borderRadius: 'var(--lf-radius)',
                boxShadow: 'var(--lf-shadow)',
              }}
              onMouseEnter={() => setHoveredLink(link._id)}
              onMouseLeave={() => setHoveredLink(null)}
              onClick={() => {
                void recordLinkClick(link._id, user.username);
                window.open(link.url, '_blank', 'noopener,noreferrer');
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium" style={{ color: 'var(--lf-text-primary)' }}>
                  {link.title}
                </span>
                <span className="text-xs" style={{ color: 'var(--lf-text-secondary)' }}>
                  Visit ↗
                </span>
              </div>
            </button>
          ))}
        </div>

        <section
          className="mt-8 text-left border p-4"
          style={{
            backgroundColor: 'var(--lf-card-bg)',
            border: '1px solid var(--lf-card-border)',
            borderRadius: 'var(--lf-radius)',
            boxShadow: 'var(--lf-shadow)',
          }}
        >
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--lf-text-primary)' }}>
            Leave a message
          </h2>
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
              className="w-full border px-3 py-2 outline-none focus:ring-2"
              style={{
                borderColor: 'var(--lf-card-border)',
                borderRadius: 'var(--lf-radius)',
                color: 'var(--lf-text-primary)',
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--lf-text-secondary)' }}>
                {content.length}/60
              </span>
              <button
                type="submit"
                disabled={sending}
                className="px-4 py-2 font-medium disabled:opacity-60"
                style={{
                  backgroundColor: 'var(--lf-accent)',
                  color: 'var(--lf-accent-text)',
                  borderRadius: 'var(--lf-radius)',
                }}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
          {messageStatus ? (
            <p
              className={`mt-2 text-sm ${
                messageStatus === 'Message sent!' ? 'text-green-600' : ''
              }`}
              style={
                messageStatus === 'Message sent!'
                  ? undefined
                  : { color: 'var(--lf-text-secondary)' }
              }
            >
              {messageStatus}
            </p>
          ) : null}
        </section>

        <footer
          className="mt-8 text-center text-xs"
          style={{ color: 'var(--lf-text-secondary)' }}
        >
          <Link href="/" className="hover:opacity-80 transition-opacity">
            Powered by LinkFolio
          </Link>
        </footer>
      </div>
    </div>
  );
}
