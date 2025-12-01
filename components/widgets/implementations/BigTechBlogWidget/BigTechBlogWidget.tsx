'use client';

import { ExternalLink } from 'lucide-react';
import { WidgetProps } from '../../core/types';
import { WidgetContainer } from '../../core/WidgetContainer';
import { useBigTechBlogData } from './useBigTechBlogData';
import { BigTechBlogPost, BigTechBlogWidgetConfig } from './types';

export function BigTechBlogWidget({
  config,
  onRemove,
}: WidgetProps<BigTechBlogPost[], BigTechBlogWidgetConfig>) {
  const { data, isLoading, isError, error, refetch } = useBigTechBlogData(config.config);

  return (
    <WidgetContainer
      config={config}
      onRemove={onRemove}
      onRefresh={() => refetch()}
      isLoading={isLoading}
      isError={isError}
      error={error ?? undefined}
    >
      {data && (
        <div className="space-y-3">
          {data.map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: post.companyColor }}
                />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {post.companyName}
                </span>
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {post.title}
                <ExternalLink className="inline-block w-3 h-3 ml-1 opacity-0 group-hover:opacity-100" />
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-xs text-gray-400">{post.postedAt}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </WidgetContainer>
  );
}
