'use client';

import { usePathname, useRouter } from 'next/navigation';

export function ComponentTabNav() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { name: 'Inputs & Controls', value: 'inputs' },
    { name: 'Display & Typography', value: 'display' },
    { name: 'Feedback & Loading', value: 'feedback' },
    { name: 'Overlays', value: 'overlays' },
    { name: 'Layout', value: 'layout' },
    { name: 'Community', value: 'community' },
  ];

  const currentTab = pathname.includes('display')
    ? 'display'
    : pathname.includes('feedback')
    ? 'feedback'
    : pathname.includes('overlays')
    ? 'overlays'
    : pathname.includes('layout')
    ? 'layout'
    : pathname.includes('community')
    ? 'community'
    : 'inputs';

  const handleTabChange = (value: string) => {
    if (value === 'inputs') {
      router.push('/design-guide/components');
    } else {
      router.push(`/design-guide/components/${value}`);
    }
  };

  return (
    <div className="border-b border-slate-200 mb-6">
      <nav className="flex gap-6">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`
                px-1 py-3 text-sm font-medium border-b-2 transition-colors
                ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
