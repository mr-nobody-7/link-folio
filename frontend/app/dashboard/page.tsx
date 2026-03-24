'use client';

import {
  getLinks,
  createLink,
  updateLinks,
  deleteLink,
  updateProfile,
  getToken,
  clearToken,
  getProfile,
  getMessages,
} from '@/api/linkfolioApi';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import SortableLinkItem from '@/components/dashboard/SortableLinkItem';

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
  clicks?: number;
};

type DashboardMessage = {
  _id?: string;
  content: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<DashboardUser | null>(null);
  const [links, setLinks] = useState<DashboardLink[]>([]);
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
  });

  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkForm, setNewLinkForm] = useState({
    title: '',
    url: '',
    isTemporary: false,
  });

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
        const [profileRes, linksRes] = await Promise.all([
          getProfile(username),
          getLinks(),
        ]);

        const profileUser = (profileRes as { user: DashboardUser })?.user;

        setUser(profileUser);
        setProfileForm({
          displayName: profileUser?.displayName || '',
          bio: profileUser?.bio || '',
          avatarUrl: profileUser?.avatarUrl || '',
        });
        setLinks((linksRes as DashboardLink[]) || []);

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
  }, [router]);

  const refreshLinks = async () => {
    const data = await getLinks();
    setLinks((data as DashboardLink[]) || []);
  };

  const handleLogout = () => {
    clearToken();
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

  const handleCreateLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newLinkForm.title.trim() || !newLinkForm.url.trim()) {
      setError('Title and URL are required');
      return;
    }

    try {
      await createLink({
        title: newLinkForm.title.trim(),
        url: newLinkForm.url.trim(),
        isTemporary: newLinkForm.isTemporary,
      });
      setNewLinkForm({ title: '', url: '', isTemporary: false });
      setShowAddLink(false);
      await refreshLinks();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to add link';
      setError(message);
    }
  };

  const handleDeleteLink = async (link: DashboardLink) => {
    const targetId = link._id || link.id;
    if (!targetId) return;

    try {
      await deleteLink(targetId);
      setLinks((prev) => prev.filter((item) => (item._id || item.id) !== targetId));
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to delete link';
      setError(message);
    }
  };

  const handleToggleLinkEnabled = async (linkId: string, enabled: boolean) => {
    try {
      const updatedLinks = links.map((link) => {
        const id = link._id || link.id;
        if (id === linkId) {
          return { ...link, enabled };
        }
        return link;
      });

      await updateLinks(
        updatedLinks.map((link) => ({
          _id: link._id || link.id,
          title: link.title,
          url: link.url,
          enabled: link.enabled,
          order: link.order,
          isTemporary: link.isTemporary,
        }))
      );

      setLinks(updatedLinks);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to toggle link';
      setError(message);
    }
  };

  const handleEditLink = async (
    linkId: string,
    title: string,
    url: string
  ) => {
    try {
      const updatedLinks = links.map((link) => {
        const id = link._id || link.id;
        if (id === linkId) {
          return { ...link, title, url };
        }
        return link;
      });

      await updateLinks(
        updatedLinks.map((link) => ({
          _id: link._id || link.id,
          title: link.title,
          url: link.url,
          enabled: link.enabled,
          order: link.order,
          isTemporary: link.isTemporary,
        }))
      );

      setLinks(updatedLinks);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to update link';
      setError(message);
    }
  };

  const handleDeleteLinkById = async (linkId: string) => {
    try {
      await deleteLink(linkId);
      setLinks((prev) =>
        prev.filter((link) => (link._id || link.id) !== linkId)
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to delete link';
      setError(message);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex(
      (link) => (link._id || link.id) === active.id
    );
    const newIndex = links.findIndex(
      (link) => (link._id || link.id) === over.id
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(links, oldIndex, newIndex);
    const reorderedWithOrder = reordered.map((link, index) => ({
      ...link,
      order: index,
    }));

    setLinks(reorderedWithOrder);

    try {
      await updateLinks(
        reorderedWithOrder.map((link) => ({
          _id: link._id || link.id,
          title: link.title,
          url: link.url,
          enabled: link.enabled,
          order: link.order,
          isTemporary: link.isTemporary,
        }))
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to reorder links';
      setError(message);
      setLinks(links);
    }
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
            onClick={handleLogout}
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
              <img
                src={user.avatarUrl}
                alt={user.displayName || user.username}
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
              <Input
                placeholder="Avatar URL"
                value={profileForm.avatarUrl}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, avatarUrl: e.target.value }))
                }
              />
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
                    }))
                  }
                />
                Temporary link
              </label>
              <Button type="submit" className="bg-[#ec5c33] hover:bg-[#d54a29] text-white">Save</Button>
            </form>
          ) : null}

          {links.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-5 text-center text-sm text-[#888888]">
              No links yet. Add your first link to get started.
            </div>
          ) : null}

          <DndContext
            sensors={useSensors(
              useSensor(PointerSensor, {
                activationConstraint: {
                  distance: 8,
                },
              }),
              useSensor(KeyboardSensor, {
                coordinateGetter: sortableKeyboardCoordinates,
              })
            )}
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
                    onToggle={handleToggleLinkEnabled}
                    onDelete={handleDeleteLinkById}
                    onEdit={handleEditLink}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
