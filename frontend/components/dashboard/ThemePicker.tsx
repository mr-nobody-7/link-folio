'use client';

import { THEMES } from '@/lib/themes';

type ThemePickerProps = {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  saving: boolean;
};

export default function ThemePicker({
  currentTheme,
  onThemeChange,
  saving,
}: ThemePickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#888888]">Theme</p>
        {saving ? <span className="text-xs text-[#888888]">Saving...</span> : null}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {THEMES.map((theme) => {
          const active = currentTheme === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onThemeChange(theme.id)}
              className={`rounded-xl p-2 text-left transition-colors ${
                active
                  ? 'ring-2 ring-offset-2 ring-[#ec5c33] border-transparent'
                  : 'border border-gray-200'
              }`}
              aria-pressed={active}
              disabled={saving}
            >
              <div
                style={{
                  background: theme.vars['--lf-bg'],
                  borderRadius: 8,
                  padding: 8,
                }}
                className="border border-black/5"
              >
                <div
                  style={{
                    background: theme.vars['--lf-card-bg'],
                    border: `1px solid ${theme.vars['--lf-card-border']}`,
                    borderRadius: theme.vars['--lf-radius'],
                    height: 24,
                    width: '100%',
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-[#504d46]">{theme.name}</span>
                {active ? <span className="text-[#ec5c33] text-sm">✓</span> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
