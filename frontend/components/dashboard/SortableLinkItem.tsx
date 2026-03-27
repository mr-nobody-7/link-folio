'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type LinkData = {
  _id?: string;
  id?: string;
  title: string;
  url: string;
  enabled: boolean;
  order?: number;
  isTemporary?: boolean;
  expiresAt?: string;
  clicks?: number;
};

function timeUntil(date: string): string {
  const targetTime = new Date(date).getTime();
  const diffMs = targetTime - Date.now();

  if (Number.isNaN(targetTime) || diffMs <= 0) {
    return 'Expired';
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `in ${hours}h ${minutes}m`;
}

interface SortableLinkItemProps {
  link: LinkData;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, url: string) => void;
}

export default function SortableLinkItem({
  link,
  onToggle,
  onDelete,
  onEdit,
}: SortableLinkItemProps) {
  const linkId = link._id || link.id || '';
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(link.title);
  const [editUrl, setEditUrl] = useState(link.url);
  const [editError, setEditError] = useState('');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: linkId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = () => {
    onToggle(linkId, !link.enabled);
  };

  const handleDeleteClick = () => {
    if (
      typeof window !== 'undefined' &&
      window.confirm(`Delete link "${link.title}"?`)
    ) {
      onDelete(linkId);
    }
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditError('');
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditError('');
  };

  const handleEditSave = () => {
    setEditError('');

    const trimmedTitle = editTitle.trim();
    const trimmedUrl = editUrl.trim();

    if (!trimmedTitle) {
      setEditError('Title is required');
      return;
    }

    if (!trimmedUrl) {
      setEditError('URL is required');
      return;
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      setEditError('URL must start with http:// or https://');
      return;
    }

    onEdit(linkId, trimmedTitle, trimmedUrl);
    setIsEditing(false);
  };

  const truncatedUrl =
    link.url.length > 30 ? link.url.substring(0, 30) + '...' : link.url;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-gray-200 rounded-xl p-4 transition-all ${
        isDragging ? 'z-10 shadow-lg' : 'shadow-sm'
      } ${link.enabled ? '' : 'opacity-50'}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none pt-1 hover:text-[#ec5c33] transition-colors"
          title="Drag to reorder"
        >
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full mt-0.5"></div>
          <div className="w-1 h-1 bg-current rounded-full mt-0.5"></div>
          <div className="w-1 h-1 bg-current rounded-full mt-0.5"></div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <Input
                  placeholder="Link title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <Input
                  placeholder="https://example.com"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                />
              </div>
              {editError && (
                <p className="text-xs text-red-500">{editError}</p>
              )}
            </div>
          ) : (
            <>
              <p className="font-medium text-black">{link.title}</p>
              <p className="text-sm text-[#888888]">{truncatedUrl}</p>
            </>
          )}
        </div>

        {/* Clicks Badge */}
        {!isEditing && (
          <div className="flex flex-col gap-1 items-end">
            <span className="text-xs bg-[#ec5c33]/10 text-[#ec5c33] px-2 py-1 rounded-full whitespace-nowrap">
              {link.clicks || 0} clicks
            </span>
            {link.isTemporary ? (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
                Expires {link.expiresAt ? timeUntil(link.expiresAt) : 'in 24h'}
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {isEditing ? (
          <>
            <Button
              type="button"
              className="bg-[#ec5c33] hover:bg-[#d54a29] text-white text-sm"
              onClick={handleEditSave}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-sm"
              onClick={handleEditCancel}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            {/* Toggle Enabled/Disabled */}
            <button
              type="button"
              onClick={handleToggle}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                link.enabled
                  ? 'bg-[#ec5c33]/10 text-[#ec5c33] hover:bg-[#ec5c33]/20'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {link.enabled ? 'Enabled' : 'Disabled'}
            </button>

            {/* Edit Button */}
            <Button
              type="button"
              variant="outline"
              className="text-sm"
              onClick={handleEditStart}
            >
              Edit
            </Button>

            {/* Delete Button */}
            <Button
              type="button"
              variant="destructive"
              className="text-sm"
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
