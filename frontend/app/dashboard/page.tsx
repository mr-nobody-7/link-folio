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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';

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

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkForm, setEditLinkForm] = useState({ title: '', url: '' });

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
        const [profileRes, linksRes, messagesRes] = await Promise.all([
          getProfile(username),
          getLinks(),
          getMessages(username),
        ]);

        const profileUser = (profileRes as { user: DashboardUser })?.user;

        setUser(profileUser);
        setProfileForm({
          displayName: profileUser?.displayName || '',
          bio: profileUser?.bio || '',
          avatarUrl: profileUser?.avatarUrl || '',
        });
        setLinks((linksRes as DashboardLink[]) || []);
        setMessages((messagesRes as DashboardMessage[]) || []);
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lf_user');
    }
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

  const handleToggleEnabled = async (targetLink: DashboardLink) => {
    try {
      const normalizedLinks = links.map((link) => {
        const linkId = link._id || link.id;
        const targetId = targetLink._id || targetLink.id;
        if (linkId === targetId) {
          return { ...link, enabled: !link.enabled };
        }
        return link;
      });

      await updateLinks(
        normalizedLinks.map((link) => ({
          _id: link._id || link.id,
          title: link.title,
          url: link.url,
          enabled: link.enabled,
          order: link.order,
          isTemporary: link.isTemporary,
        }))
      );

      setLinks(normalizedLinks);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to toggle link';
      setError(message);
    }
  };

  const startEditLink = (link: DashboardLink) => {
    setEditingLinkId(link._id || link.id || null);
    setEditLinkForm({ title: link.title, url: link.url });
  };

  const saveEditLink = async (link: DashboardLink) => {
    const targetId = link._id || link.id;
    if (!targetId) return;

    try {
      const normalizedLinks = links.map((current) => {
        const currentId = current._id || current.id;
        if (currentId === targetId) {
          return {
            ...current,
            title: editLinkForm.title.trim() || current.title,
            url: editLinkForm.url.trim() || current.url,
          };
        }
        return current;
      });

      await updateLinks(
        normalizedLinks.map((current) => ({
          _id: current._id || current.id,
          title: current.title,
          url: current.url,
          enabled: current.enabled,
          order: current.order,
          isTemporary: current.isTemporary,
        }))
      );

      setLinks(normalizedLinks);
      setEditingLinkId(null);
      setEditLinkForm({ title: '', url: '' });
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to update link';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <header className="w-full border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">LinkFolio</h1>
          <Button
            onClick={handleLogout}
            className="bg-[#ec5c33] hover:bg-[#d54a29] text-white"
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-gray-200 p-5 md:col-span-2">
          <div className="flex items-start gap-4">
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
              <a
                href={`/${user?.username || ''}`}
                className="text-[#ec5c33] mt-2 inline-block hover:underline"
              >
                yourdomain.com/{user?.username || 'username'}
              </a>
            </div>
            <Button variant="outline" onClick={() => setShowEditProfile((v) => !v)}>
              Edit Profile
            </Button>
          </div>

          {showEditProfile ? (
            <form onSubmit={handleProfileSave} className="mt-4 grid gap-3">
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
                <Button className="bg-[#ec5c33] hover:bg-[#d54a29] text-white">
                  Save Profile
                </Button>
              </div>
            </form>
          ) : null}
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5">
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
            <form onSubmit={handleCreateLink} className="space-y-3 mb-4 border rounded-xl p-3">
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
              <Button className="bg-[#ec5c33] hover:bg-[#d54a29] text-white">Save</Button>
            </form>
          ) : null}

          <div className="space-y-3">
            {links.map((link) => {
              const id = link._id || link.id || '';
              const isEditing = editingLinkId === id;
              return (
                <div key={id} className="border rounded-xl p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-[#888888] select-none mt-1">⋮⋮</span>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editLinkForm.title}
                            onChange={(e) =>
                              setEditLinkForm((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                          />
                          <Input
                            value={editLinkForm.url}
                            onChange={(e) =>
                              setEditLinkForm((prev) => ({
                                ...prev,
                                url: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <>
                          <p className="font-medium text-black">{link.title}</p>
                          <p className="text-sm text-[#888888] truncate">{link.url}</p>
                        </>
                      )}
                    </div>
                    <span className="text-xs bg-[#ec5c33]/10 text-[#ec5c33] px-2 py-1 rounded-full">
                      {link.clicks || 0} clicks
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => void handleToggleEnabled(link)}
                    >
                      {link.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    {isEditing ? (
                      <Button
                        className="bg-[#ec5c33] hover:bg-[#d54a29] text-white"
                        onClick={() => void saveEditLink(link)}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => startEditLink(link)}>
                        Edit
                      </Button>
                    )}
                    <Button variant="destructive" onClick={() => void handleDeleteLink(link)}>
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5">
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

      {error ? (
        <div className="fixed bottom-4 right-4 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      ) : null}
    </div>
  );
}
