'use client';

import {
  getLinks,
  updateProfile,
  uploadAvatar,
  getToken,
  clearToken,
  getProfile,
  getMessages,
  getAnalytics,
} from '@/api/linkfolioApi';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableLinkItem from '@/components/dashboard/SortableLinkItem';
import AnalyticsCard from '@/components/dashboard/AnalyticsCard';
import ThemePicker from '@/components/dashboard/ThemePicker';
import QRCodeCard from '@/components/dashboard/QRCodeCard';
import useLinks from '@/hooks/useLinks';

type DashboardUser = {
  id?: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  theme?: string;
  views?: number;
};

type DashboardLink = {
  _id?: string;
  id?: string;
  title: string;
  url: string;
  enabled: boolean;
  order: number;
  isTemporary?: boolean;
  expiresAt?: string;
  clicks?: number;
};

type DashboardMessage = {
  _id?: string;
  content: string;
  createdAt: string;
};

type DashboardAnalyticsDaily = {
  date: string;
  count: number;
};

type DashboardAnalyticsLink = {
  _id: string;
  title: string;
  clicks: number;
};

type DashboardAnalytics = {
  links: DashboardAnalyticsLink[];
  daily: DashboardAnalyticsDaily[];
  todayCount: number;
  weekCount: number;
  days: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const initialLinksRef = useRef<DashboardLink[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarPreviewUrlRef = useRef<string | null>(null);
  const {
    links,
    error: linkError,
    optimisticToggle,
    optimisticDelete,
    optimisticEdit,
    optimisticReorder,
    addLink,
    setLinks,
  } = useLinks(initialLinksRef.current);

  const [user, setUser] = useState<DashboardUser | null>(null);
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<DashboardAnalytics | null>(
    null
  );
  const [analyticsDays, setAnalyticsDays] = useState(7);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
    theme: 'default',
  });

  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkForm, setNewLinkForm] = useState({
    title: '',
    url: '',
    isTemporary: false,
    expiresAt: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    const stored = localStorage.getItem('lf_user');
    if (!stored) {
      setError('User session is missing. Please log in again.');
      setLoading(false);
      return;
    }

    let storedUser: { username?: string };
    try {
      storedUser = JSON.parse(stored);
    } catch {
      setError('User session is invalid. Please log in again.');
      setLoading(false);
      return;
    }

    if (!storedUser?.username) {
      setError('Username not found in session. Please log in again.');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const username = storedUser.username as string;
        const [profileRes, linksRes, analyticsRes] = await Promise.all([
          getProfile(username),
          getLinks(),
          getAnalytics(7),
        ]);

        const profileUser = (profileRes as { user: DashboardUser })?.user;

        setUser(profileUser);
        setProfileForm({
          displayName: profileUser?.displayName || '',
          bio: profileUser?.bio || '',
          avatarUrl: profileUser?.avatarUrl || '',
          theme: profileUser?.theme || 'default',
        });
        const fetchedLinks = (linksRes as DashboardLink[]) || [];
        initialLinksRef.current = fetchedLinks;
        setLinks(fetchedLinks);
        setAnalyticsData((analyticsRes as DashboardAnalytics) || null);
        setAnalyticsDays(7);

        void getMessages(username)
          .then((messagesRes) => {
            setMessages((messagesRes as DashboardMessage[]) || []);
          })
          .catch(() => {
            setMessages([]);
          });
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Failed to load dashboard';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [router, setLinks]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrlRef.current) {
        URL.revokeObjectURL(avatarPreviewUrlRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    await clearToken();
    router.push('/');
  };

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const updated = (await updateProfile(profileForm)) as DashboardUser;
      setUser((prev) => ({
        ...(prev || { username: updated.username }),
        ...updated,
      }));
      setShowEditProfile(false);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to update profile';
      setError(message);
    }
  };

  const handleThemeChange = async (themeId: string) => {
    try {
      setThemeSaving(true);
      const updated = (await updateProfile({ theme: themeId })) as DashboardUser;
      setUser((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          ...updated,
          theme: updated.theme || themeId,
        };
      });
      setProfileForm((prev) => ({
        ...prev,
        theme: updated.theme || themeId,
      }));
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to update theme';
      setError(message);
    } finally {
      setThemeSaving(false);
    }
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be 5MB or less');
      event.target.value = '';
      return;
    }

    const previousAvatarUrl = profileForm.avatarUrl;
    const previewUrl = URL.createObjectURL(file);

    if (avatarPreviewUrlRef.current) {
      URL.revokeObjectURL(avatarPreviewUrlRef.current);
    }
    avatarPreviewUrlRef.current = previewUrl;

    setProfileForm((prev) => ({
      ...prev,
      avatarUrl: previewUrl,
    }));

    setAvatarUploading(true);
    setError(null);

    try {
      const result = await uploadAvatar(file);

      if (avatarPreviewUrlRef.current) {
        URL.revokeObjectURL(avatarPreviewUrlRef.current);
        avatarPreviewUrlRef.current = null;
      }

      setProfileForm((prev) => ({
        ...prev,
        avatarUrl: result.avatarUrl,
      }));
      setUser((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          avatarUrl: result.avatarUrl,
        };
      });
    } catch (requestError) {
      if (avatarPreviewUrlRef.current) {
        URL.revokeObjectURL(avatarPreviewUrlRef.current);
        avatarPreviewUrlRef.current = null;
      }

      setProfileForm((prev) => ({
        ...prev,
        avatarUrl: previousAvatarUrl,
      }));

      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to upload image';
      setError(message);
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
  };

  const handleCreateLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newLinkForm.title.trim() || !newLinkForm.url.trim()) {
      setError('Title and URL are required');
      return;
    }

    try {
      await addLink({
        title: newLinkForm.title.trim(),
        url: newLinkForm.url.trim(),
        isTemporary: newLinkForm.isTemporary,
        expiresAt:
          newLinkForm.isTemporary && newLinkForm.expiresAt
            ? new Date(newLinkForm.expiresAt).toISOString()
            : undefined,
      });
      setNewLinkForm({ title: '', url: '', isTemporary: false, expiresAt: '' });
      setShowAddLink(false);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to add link';
      setError(message);
    }
  };

  const handleDaysChange = async (newDays: number) => {
    try {
      setAnalyticsDays(newDays);
      setAnalyticsLoading(true);
      const analyticsRes = await getAnalytics(newDays);
      setAnalyticsData((analyticsRes as DashboardAnalytics) || null);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to load analytics';
      setError(message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex(
      (link) => (link._id || link.id) === active.id
    );
    const newIndex = links.findIndex(
      (link) => (link._id || link.id) === over.id
    );

    if (oldIndex === -1 || newIndex === -1) return;

    await optimisticReorder(oldIndex, newIndex);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <header className="w-full border-b bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">LinkFolio</h1>
            <p className="text-sm text-[#888888]">Manage your profile and links</p>
          </div>
          <Button
            onClick={() => void handleLogout()}
            className="bg-[#ec5c33] hover:bg-[#d54a29] text-white"
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {error ? (
          <div className="md:col-span-2 rounded-xl border border-[#ec5c33]/25 bg-[#ec5c33]/5 text-[#504d46] px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <section className="bg-white rounded-2xl border border-gray-200 p-5 md:col-span-2 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName || user.username}
                width={64}
                height={64}
                unoptimized
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#ec5c33]/15 text-[#ec5c33] text-2xl font-bold flex items-center justify-center">
                {(user?.displayName || user?.username || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-black">
                {user?.displayName || 'Your Name'}
              </h2>
              <p className="text-[#888888]">@{user?.username || 'username'}</p>
              {user?.bio ? <p className="text-[#504d46] mt-2">{user.bio}</p> : null}
              <Link
                href={`/${user?.username || ''}`}
                target="_blank"
                className="text-[#ec5c33] mt-2 inline-block hover:underline"
              >
                yourdomain.com/{user?.username || 'username'}
              </Link>
            </div>
            <Button
              variant="outline"
              className="border-[#ec5c33]/35 text-[#ec5c33] hover:bg-[#ec5c33]/5"
              onClick={() => setShowEditProfile((v) => !v)}
            >
              Edit Profile
            </Button>
          </div>

          {showEditProfile ? (
            <form onSubmit={handleProfileSave} className="mt-4 grid gap-3 p-4 rounded-xl bg-[#f8f8f8] border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  {profileForm.avatarUrl ? (
                    <Image
                      src={profileForm.avatarUrl}
                      alt={profileForm.displayName || user?.username || 'Avatar'}
                      width={80}
                      height={80}
                      unoptimized
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#ec5c33]/15 text-[#ec5c33] text-2xl font-bold flex items-center justify-center">
                      {(profileForm.displayName || user?.username || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  {avatarUploading ? (
                    <div className="absolute inset-0 rounded-full bg-black/35 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : null}
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#ec5c33]/35 text-[#ec5c33] hover:bg-[#ec5c33]/5"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? 'Uploading...' : 'Change photo'}
                  </Button>
                  <p className="text-xs text-[#888888] mt-2">PNG, JPG, WEBP, or GIF up to 5MB</p>
                </div>
              </div>

              <Input
                placeholder="Display Name"
                value={profileForm.displayName}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, displayName: e.target.value }))
                }
              />
              <Input
                placeholder="Bio"
                value={profileForm.bio}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
              />
              <ThemePicker
                currentTheme={user?.theme || 'default'}
                onThemeChange={handleThemeChange}
                saving={themeSaving}
              />
              <button
                type="button"
                className="w-fit text-sm text-[#ec5c33] hover:underline"
                onClick={() => {
                  if (!user?.username) {
                    return;
                  }

                  window.open(`/${user.username}`, '_blank');
                }}
              >
                See how your profile looks →
              </button>
              <div>
                <Button type="submit" className="bg-[#ec5c33] hover:bg-[#d54a29] text-white">
                  Save Profile
                </Button>
              </div>
            </form>
          ) : null}
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-black">Your Links</h3>
            <Button
              className="bg-[#ec5c33] hover:bg-[#d54a29] text-white"
              onClick={() => setShowAddLink((v) => !v)}
            >
              Add Link
            </Button>
          </div>

          {showAddLink ? (
            <form onSubmit={handleCreateLink} className="space-y-3 mb-4 border border-gray-200 rounded-xl p-3 bg-[#f8f8f8]">
              <Input
                placeholder="Link title"
                value={newLinkForm.title}
                onChange={(e) =>
                  setNewLinkForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <Input
                placeholder="https://example.com"
                value={newLinkForm.url}
                onChange={(e) =>
                  setNewLinkForm((prev) => ({ ...prev, url: e.target.value }))
                }
              />
              <label className="flex items-center gap-2 text-sm text-[#504d46]">
                <input
                  type="checkbox"
                  checked={newLinkForm.isTemporary}
                  onChange={(e) =>
                    setNewLinkForm((prev) => ({
                      ...prev,
                      isTemporary: e.target.checked,
                      expiresAt: e.target.checked ? prev.expiresAt : '',
                    }))
                  }
                />
                Temporary link (expires in 24 hours)
              </label>
              {newLinkForm.isTemporary ? (
                <div className="space-y-1">
                  <label className="text-xs text-[#888888]">Custom expiry</label>
                  <Input
                    type="datetime-local"
                    value={newLinkForm.expiresAt}
                    onChange={(e) =>
                      setNewLinkForm((prev) => ({
                        ...prev,
                        expiresAt: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-[#888888]">Leave empty to expire in 24h</p>
                </div>
              ) : null}
              <Button type="submit" className="bg-[#ec5c33] hover:bg-[#d54a29] text-white">Save</Button>
            </form>
          ) : null}

          {links.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-5 text-center text-sm text-[#888888]">
              No links yet. Add your first link to get started.
            </div>
          ) : null}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map((link) => link._id || link.id || '')}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {links.map((link) => (
                  <SortableLinkItem
                    key={link._id || link.id}
                    link={link}
                    onToggle={optimisticToggle}
                    onDelete={optimisticDelete}
                    onEdit={optimisticEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        <QRCodeCard
          username={user?.username || ''}
          displayName={user?.displayName || user?.username || ''}
        />

        {linkError ? (
          <div className="md:col-span-2 rounded-lg bg-red-500 text-white text-sm px-4 py-3 shadow-sm">
            {linkError}
          </div>
        ) : null}

        <section className="md:col-span-2">
          {analyticsLoading ? (
            <div className="h-64 w-full rounded-xl bg-gray-100 animate-pulse" />
          ) : analyticsData ? (
            <AnalyticsCard
              data={analyticsData.daily}
              todayCount={analyticsData.todayCount}
              weekCount={analyticsData.weekCount}
              days={analyticsDays}
              links={analyticsData.links}
              onDaysChange={handleDaysChange}
            />
          ) : null}
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm md:col-span-2">
          <h3 className="text-xl font-semibold text-black mb-4">Visitor Messages</h3>
          {messages.length === 0 ? (
            <p className="text-[#888888]">No messages yet</p>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message._id} className="border rounded-xl p-3">
                  <p className="text-black">{message.content}</p>
                  <p className="text-xs text-[#888888] mt-1">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

    </div>
  );
}
