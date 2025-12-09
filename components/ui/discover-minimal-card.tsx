import * as React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { cn } from '@/lib/utils';
import { Eye, Heart, Bookmark, Briefcase, BookOpen } from 'lucide-react';

dayjs.extend(relativeTime);

export interface DiscoverMinimalCardProps {
  contentId?: string;
  title: string;
  summary: string;
  thumbnailUrl?: string;
  href?: string;
  sources?: { name: string; href: string; imageUrl?: string }[];
  postedAt: string;
  stats: {
    likes: number;
    views: number;
    bookmarks: number;
  };
  badge?: string;
  badgeTone?: 'default' | 'coral' | 'success' | 'warning';
  variant?: 'default' | 'hero';
  tags?: string[];
  liked?: boolean;
  bookmarked?: boolean;
  onCardClick?: () => void;
}

export function DiscoverMinimalCard({
  title,
  summary,
  thumbnailUrl,
  sources,
  postedAt,
  stats,
  badge,
  badgeTone = 'default',
  variant = 'default',
  tags,
  liked = false,
  bookmarked = false,
  onCardClick,
}: DiscoverMinimalCardProps) {

  // Hero Variant (Side-by-Side)
  if (variant === 'hero') {
    return (
      <div
        onClick={onCardClick}
        className="group w-full cursor-pointer"
      >
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {/* Content (Left) */}
          <div className="flex-1 flex flex-col gap-4 pt-2">
            <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
              {sources && sources.length > 0 && (
                <span className="flex items-center gap-2">
                  {(() => {
                    try {
                      const hostname = new URL(sources[0].href || 'https://google.com').hostname;
                      return (
                        <img
                          src={`https://logo.clearbit.com/${hostname}`}
                          alt=""
                          className="w-4 h-4 rounded-full opacity-70"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      );
                    } catch (e) {
                      return null;
                    }
                  })()}
                  {sources[0].name}
                </span>
              )}
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{dayjs(postedAt).fromNow()}</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition-colors">
              {title}
            </h2>

            <p className="text-slate-600 text-lg line-clamp-3 leading-relaxed">
              {summary}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <Eye className="w-4 h-4" />
                <span>{stats?.views?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <Heart className={cn("w-4 h-4", liked && "fill-current text-red-500 text-red-500")} />
                <span>{stats?.likes || 0}</span>
              </div>
            </div>
          </div>

          {/* Image (Right) */}
          <div className="w-full md:w-[45%] aspect-[4/3] md:aspect-video rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-100">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Determine content type based on badge
  const isJob = badge?.includes('채용') || badge?.includes('Job');
  const isBook = badge?.includes('도서') || badge?.includes('Book');
  const isCourse = badge?.includes('강의') || badge?.includes('Course');
  const isBlog = badge?.includes('블로그') || badge?.includes('Blog');

  // Determine badge color class
  let badgeColorClass = "bg-slate-100 text-slate-600";
  if (isJob) badgeColorClass = "bg-blue-50 text-blue-700 border-blue-100";
  else if (isBook) badgeColorClass = "bg-amber-50 text-amber-700 border-amber-100";
  else if (isCourse) badgeColorClass = "bg-purple-50 text-purple-700 border-purple-100";
  else if (isBlog) badgeColorClass = "bg-emerald-50 text-emerald-700 border-emerald-100";

  // Job Card Variant
  if (isJob) {
    return (
      <div
        onClick={onCardClick}
        className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer flex flex-col gap-4"
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            {/* Square Logo for Jobs */}
            <div className="w-12 h-12 rounded-lg border border-slate-100 overflow-hidden flex-shrink-0 bg-white">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="" className="w-full h-full object-contain p-1" />
              ) : (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Briefcase className="w-6 h-6" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide", badgeColorClass)}>
                  Hiring
                </span>
                {sources && sources.length > 0 && (
                  <span className="text-xs font-medium text-slate-500">
                    {sources[0].name}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                {title}
              </h3>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
              <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current text-blue-500")} />
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {summary}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex gap-2">
            {tags?.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                {tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {postedAt && dayjs(postedAt).format('YYYY. MM. DD')}
          </div>
        </div>
      </div>
    );
  }

  // Book Card Variant
  if (isBook) {
    return (
      <div
        onClick={onCardClick}
        className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer flex gap-5"
      >
        {/* Portrait Thumbnail for Books */}
        <div className="w-24 h-36 rounded-lg border border-slate-100 overflow-hidden flex-shrink-0 shadow-sm bg-slate-50">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <BookOpen className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide", badgeColorClass)}>
                Book
              </span>
              <button className="text-slate-400 hover:text-amber-600 transition-colors">
                <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current text-amber-500")} />
              </button>
            </div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-amber-700 transition-colors mb-2 line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {summary}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3">
            {sources && sources.length > 0 && (
              <span className="text-xs font-medium text-slate-500">
                {sources[0].name}
              </span>
            )}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Heart className={cn("w-3.5 h-3.5", liked && "fill-current text-red-500")} />
                {stats?.likes || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Variant (Blogs, Courses, etc.) - Landscape
  return (
    <div
      onClick={onCardClick}
      className={cn(
        "group bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col sm:flex-row",
        isCourse ? "hover:border-purple-200" : "hover:border-emerald-200"
      )}
    >
      {/* Landscape Thumbnail */}
      {thumbnailUrl && (
        <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-slate-100 relative overflow-hidden">
          <img src={thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3">
            <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border shadow-sm uppercase tracking-wide bg-white/90 backdrop-blur-sm",
              isCourse ? "text-purple-700 border-purple-100" : "text-emerald-700 border-emerald-100"
            )}>
              {isCourse ? 'Course' : 'Article'}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            {sources && sources.length > 0 && (
              <div className="flex items-center gap-2">
                {/* Small source icon if available, or just text */}
                <span className="text-xs font-medium text-slate-500">
                  {sources[0].name}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-400">
                  {postedAt && dayjs(postedAt).format('MMM D')}
                </span>
              </div>
            )}
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current text-teal-500")} />
            </button>
          </div>

          <h3 className={cn(
            "font-bold text-slate-900 text-lg leading-tight transition-colors mb-3 line-clamp-2",
            isCourse ? "group-hover:text-purple-700" : "group-hover:text-emerald-700"
          )}>
            {title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
          <div className="flex gap-2">
            {tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {stats?.views?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className={cn("w-3.5 h-3.5", liked && "fill-current text-red-500")} />
              {stats?.likes || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
