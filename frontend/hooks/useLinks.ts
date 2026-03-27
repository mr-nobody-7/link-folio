import { useEffect, useRef, useState } from 'react';
import { createLink, deleteLink, updateLinks } from '@/api/linkfolioApi';
import { arrayMove } from '@dnd-kit/sortable';

export type LinkItem = {
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

type AddLinkInput = {
  title: string;
  url: string;
  isTemporary?: boolean;
  expiresAt?: string;
};

function getLinkId(link: LinkItem): string {
  return (link._id || link.id || '').toString();
}

function serializeLinks(links: LinkItem[]) {
  return links.map((link) => ({
    _id: getLinkId(link),
    title: link.title,
    url: link.url,
    enabled: link.enabled,
    order: link.order,
    isTemporary: link.isTemporary,
  }));
}

export default function useLinks(initialLinks: LinkItem[]) {
  const [links, setLinks] = useState<LinkItem[]>(() => initialLinks);
  const [error, setError] = useState<string | null>(null);
  const clearErrorTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (clearErrorTimerRef.current) {
        window.clearTimeout(clearErrorTimerRef.current);
      }
    };
  }, []);

  const showTemporaryError = (message: string) => {
    setError(message);

    if (clearErrorTimerRef.current) {
      window.clearTimeout(clearErrorTimerRef.current);
    }

    clearErrorTimerRef.current = window.setTimeout(() => {
      setError(null);
      clearErrorTimerRef.current = null;
    }, 3000);
  };

  const optimisticToggle = async (linkId: string, enabled: boolean) => {
    const previousLinks = links;
    const updatedLinks = previousLinks.map((link) => {
      if (getLinkId(link) === linkId) {
        return { ...link, enabled };
      }
      return link;
    });

    setLinks(updatedLinks);

    try {
      await updateLinks(serializeLinks(updatedLinks));
    } catch {
      setLinks(previousLinks);
      showTemporaryError('Failed to update link. Changes reverted.');
    }
  };

  const optimisticDelete = async (linkId: string) => {
    const previousLinks = links;
    const originalIndex = previousLinks.findIndex(
      (link) => getLinkId(link) === linkId
    );

    if (originalIndex === -1) {
      return;
    }

    const removedLink = previousLinks[originalIndex];
    const updatedLinks = previousLinks.filter((link) => getLinkId(link) !== linkId);

    setLinks(updatedLinks);

    try {
      await deleteLink(linkId);
    } catch {
      const restored = [...updatedLinks];
      restored.splice(originalIndex, 0, removedLink);
      setLinks(restored);
      showTemporaryError('Failed to delete link.');
    }
  };

  const optimisticEdit = async (linkId: string, title: string, url: string) => {
    const previousLinks = links;
    const updatedLinks = previousLinks.map((link) => {
      if (getLinkId(link) === linkId) {
        return { ...link, title, url };
      }
      return link;
    });

    setLinks(updatedLinks);

    try {
      await updateLinks(serializeLinks(updatedLinks));
    } catch {
      setLinks(previousLinks);
      showTemporaryError('Failed to save changes.');
    }
  };

  const optimisticReorder = async (oldIndex: number, newIndex: number) => {
    const previousLinks = links;
    const reordered = arrayMove(previousLinks, oldIndex, newIndex);
    const reorderedWithOrder = reordered.map((link, index) => ({
      ...link,
      order: index,
    }));

    setLinks(reorderedWithOrder);

    try {
      await updateLinks(serializeLinks(reorderedWithOrder));
    } catch {
      setLinks(previousLinks);
      showTemporaryError('Failed to save order.');
    }
  };

  const addLink = async (linkData: AddLinkInput) => {
    try {
      const response = await createLink(linkData);
      const createdLink =
        typeof response === 'object' && response && 'link' in (response as object)
          ? ((response as { link: LinkItem }).link as LinkItem)
          : (response as LinkItem);

      const currentMaxOrder = links.reduce(
        (max, link) => Math.max(max, Number.isFinite(link.order) ? link.order : 0),
        -1
      );

      const normalizedLink: LinkItem = {
        ...createdLink,
        title: createdLink?.title || linkData.title,
        url: createdLink?.url || linkData.url,
        enabled: createdLink?.enabled ?? true,
        order:
          typeof createdLink?.order === 'number'
            ? createdLink.order
            : currentMaxOrder + 1,
        isTemporary: createdLink?.isTemporary ?? linkData.isTemporary,
        expiresAt: createdLink?.expiresAt ?? linkData.expiresAt,
        clicks: createdLink?.clicks ?? 0,
      };

      setLinks((prev) => [...prev, normalizedLink]);
      return normalizedLink;
    } catch (error) {
      throw error;
    }
  };

  return {
    links,
    error,
    optimisticToggle,
    optimisticDelete,
    optimisticEdit,
    optimisticReorder,
    addLink,
    setLinks,
  };
}
