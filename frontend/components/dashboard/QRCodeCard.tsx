'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';

type QRCodeCardProps = {
  username: string;
  displayName?: string;
};

function trimText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

export default function QRCodeCard({ username, displayName }: QRCodeCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const profileUrl = useMemo(() => {
    const normalized = username.trim();
    if (!normalized) {
      return '';
    }

    return `${appBaseUrl.replace(/\/$/, '')}/${encodeURIComponent(normalized)}`;
  }, [appBaseUrl, username]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !profileUrl) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    void QRCode.toCanvas(canvas, profileUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })
      .then(() => {
        if (active) {
          setLoading(false);
        }
      })
      .catch((generationError: unknown) => {
        if (active) {
          setLoading(false);
          setError(
            generationError instanceof Error
              ? generationError.message
              : 'Failed to generate QR code'
          );
        }
      });

    return () => {
      active = false;
    };
  }, [profileUrl]);

  const handleDownload = () => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas || !profileUrl) {
      return;
    }

    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = 400;
    downloadCanvas.height = 460;

    const context = downloadCanvas.getContext('2d');
    if (!context) {
      setError('Unable to prepare download');
      return;
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    context.fillStyle = '#111827';
    context.font = 'bold 26px Inter, sans-serif';
    context.textAlign = 'center';
    context.fillText(trimText(displayName || username, 24), 200, 46);

    context.drawImage(sourceCanvas, 60, 70, 280, 280);

    context.fillStyle = '#4b5563';
    context.font = '16px Inter, sans-serif';
    context.fillText(trimText(profileUrl, 42), 200, 385);

    context.fillStyle = '#ec5c33';
    context.font = 'bold 20px Inter, sans-serif';
    context.fillText('Made with LinkFolio', 200, 430);

    const link = document.createElement('a');
    link.href = downloadCanvas.toDataURL('image/png');
    link.download = `${username || 'profile'}-qr.png`;
    link.click();
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-black">Profile QR Code</h3>
          <p className="text-sm text-[#888888] mt-1">Share your profile instantly</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-[#ec5c33]/35 text-[#ec5c33] hover:bg-[#ec5c33]/5"
          onClick={handleDownload}
          disabled={!profileUrl || loading || !!error}
        >
          Download
        </Button>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-[#f8f8f8] p-4 flex items-center justify-center min-h-[232px]">
        {error ? (
          <p className="text-sm text-[#504d46]">{error}</p>
        ) : !profileUrl ? (
          <p className="text-sm text-[#504d46]">Set a username to generate your QR code.</p>
        ) : (
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className={`rounded-lg border border-gray-200 bg-white ${loading ? 'opacity-50' : ''}`}
          />
        )}
      </div>

      <p className="mt-3 text-xs text-[#888888] break-all">{profileUrl || 'No profile URL available'}</p>
    </section>
  );
}
