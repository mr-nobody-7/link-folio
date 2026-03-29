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

type ThemeStyles = {
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  avatarBg: string;
  avatarText: string;
  primaryText: string;
  secondaryText: string;
  linkCardBg: string;
  linkCardBorder: string;
  linkCardHoverBorder: string;
  composerBg: string;
  composerBorder: string;
  inputBorder: string;
  inputFocus: string;
  buttonBg: string;
  buttonHover: string;
};

const THEME_STYLES: Record<string, ThemeStyles> = {
  default: {
    pageBg: 'bg-[#f8f8f8]',
    cardBg: 'bg-white',
    cardBorder: 'border-[#ec5c33]/25',
    avatarBg: 'bg-[#ec5c33]/15',
    avatarText: 'text-[#ec5c33]',
    primaryText: 'text-black',
    secondaryText: 'text-[#888888]',
    linkCardBg: 'bg-white',
    linkCardBorder: 'border-[#ec5c33]/25',
    linkCardHoverBorder: 'hover:border-[#ec5c33]',
    composerBg: 'bg-white',
    composerBorder: 'border-[#ec5c33]/25',
    inputBorder: 'border-[#ec5c33]/30',
    inputFocus: 'focus:ring-[#ec5c33]/30',
    buttonBg: 'bg-[#ec5c33]',
    buttonHover: 'hover:bg-[#d54a29]',
  },
  midnight: {
    pageBg: 'bg-[#111827]',
    cardBg: 'bg-[#1f2937]',
    cardBorder: 'border-[#374151]',
    avatarBg: 'bg-[#374151]',
    avatarText: 'text-[#f3f4f6]',
    primaryText: 'text-[#f9fafb]',
    secondaryText: 'text-[#d1d5db]',
    linkCardBg: 'bg-[#1f2937]',
    linkCardBorder: 'border-[#374151]',
    linkCardHoverBorder: 'hover:border-[#4b5563]',
    composerBg: 'bg-[#1f2937]',
    composerBorder: 'border-[#374151]',
    inputBorder: 'border-[#4b5563]',
    inputFocus: 'focus:ring-[#6b7280]/40',
    buttonBg: 'bg-[#4f46e5]',
    buttonHover: 'hover:bg-[#4338ca]',
  },
  sunset: {
    pageBg: 'bg-[#fff7ed]',
    cardBg: 'bg-white',
    cardBorder: 'border-[#fdba74]',
    avatarBg: 'bg-[#fed7aa]',
    avatarText: 'text-[#c2410c]',
    primaryText: 'text-[#7c2d12]',
    secondaryText: 'text-[#9a3412]',
    linkCardBg: 'bg-white',
    linkCardBorder: 'border-[#fdba74]',
    linkCardHoverBorder: 'hover:border-[#fb923c]',
    composerBg: 'bg-white',
    composerBorder: 'border-[#fdba74]',
    inputBorder: 'border-[#fdba74]',
    inputFocus: 'focus:ring-[#fb923c]/30',
    buttonBg: 'bg-[#ea580c]',
    buttonHover: 'hover:bg-[#c2410c]',
  },
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
  const theme = THEME_STYLES[user.theme || 'default'] || THEME_STYLES.default;

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
    <div className={`min-h-screen px-4 py-10 ${theme.pageBg}`}>
      <div className="max-w-md mx-auto text-center">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={displayName}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
          />
        ) : (
          <div
            className={`w-20 h-20 rounded-full font-bold text-3xl flex items-center justify-center mx-auto mb-4 ${theme.avatarBg} ${theme.avatarText}`}
          >
            {avatarLetter}
          </div>
        )}

        <h1 className={`text-3xl font-bold ${theme.primaryText}`}>{displayName}</h1>
        <p className={`mt-1 ${theme.secondaryText}`}>@{user.username}</p>
        {user.bio ? (
          <p className={`mt-3 leading-relaxed ${theme.secondaryText}`}>{user.bio}</p>
        ) : null}

        <div className="mt-8 space-y-3 text-left">
          {links.length === 0 ? (
            <p
              className={`text-sm text-center border border-dashed rounded-xl py-4 ${theme.secondaryText} ${theme.cardBorder}`}
            >
              No links yet.
            </p>
          ) : null}
          {links.map((link) => (
            <button
              key={link._id}
              className={`w-full text-left rounded-xl border px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${theme.linkCardBg} ${theme.linkCardBorder} ${theme.linkCardHoverBorder}`}
              onClick={() => {
                void recordLinkClick(link._id, user.username);
                window.open(link.url, '_blank', 'noopener,noreferrer');
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`font-medium ${theme.primaryText}`}>{link.title}</span>
                <span className={`text-xs ${theme.secondaryText}`}>Visit ↗</span>
              </div>
            </button>
          ))}
        </div>

        <section
          className={`mt-8 text-left rounded-xl border p-4 ${theme.composerBg} ${theme.composerBorder}`}
        >
          <h2 className={`text-lg font-semibold mb-3 ${theme.primaryText}`}>Leave a message</h2>
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
              className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${theme.inputBorder} ${theme.inputFocus}`}
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs ${theme.secondaryText}`}>{content.length}/60</span>
              <button
                type="submit"
                disabled={sending}
                className={`px-4 py-2 rounded-lg text-white font-medium disabled:opacity-60 ${theme.buttonBg} ${theme.buttonHover}`}
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
                  : theme.secondaryText
              }`}
            >
              {messageStatus}
            </p>
          ) : null}
        </section>

        <footer className={`mt-8 text-center text-xs ${theme.secondaryText}`}>
          <Link href="/" className="hover:opacity-80 transition-opacity">
            Powered by LinkFolio
          </Link>
        </footer>
      </div>
    </div>
  );
}
