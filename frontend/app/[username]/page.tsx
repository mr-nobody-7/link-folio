import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProfileClient from './ProfileClient';

type ProfileUser = {
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  views?: number;
  theme?: string;
};

type ProfileLink = {
  _id: string;
  title: string;
  url: string;
  enabled: boolean;
  clicks: number;
};

type ProfileResponse = {
  user: ProfileUser;
  links: ProfileLink[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function fetchProfile(username: string): Promise<ProfileResponse | null> {
  const res = await fetch(`${API_BASE_URL}/profile/${username}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as ProfileResponse;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  try {
    const { username } = await params;
    const profile = await fetchProfile(username);

    if (!profile) {
      return {
        title: 'Profile not found - LinkFolio',
      };
    }

    const { user } = profile;
    const displayName = user.displayName || user.username;
    const title = `${displayName} (@${user.username}) - LinkFolio`;
    const description = user.bio
      ? `${user.bio} | Check out my links on LinkFolio`
      : `Check out ${displayName}'s links on LinkFolio`;
    const url = `${APP_BASE_URL}/${user.username}`;
    const image = user.avatarUrl || `${APP_BASE_URL}/og-default.png`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        type: 'profile',
        images: [
          {
            url: image,
            width: 400,
            height: 400,
            alt: `${displayName}'s avatar`,
          },
        ],
        siteName: 'LinkFolio',
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: [image],
        site: '@linkfolio',
      },
      alternates: {
        canonical: url,
      },
    };
  } catch {
    return { title: 'LinkFolio' };
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await fetchProfile(username);

  if (!profile) {
    notFound();
  }

  const normalizedUser = {
    username: profile.user.username,
    displayName: profile.user.displayName || profile.user.username,
    bio: profile.user.bio || '',
    avatarUrl: profile.user.avatarUrl || '',
    views: profile.user.views || 0,
    theme: profile.user.theme,
  };

  const enabledLinks = profile.links.filter((link) => link.enabled !== false);

  return <ProfileClient user={normalizedUser} links={enabledLinks} />;
}
