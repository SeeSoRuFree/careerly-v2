'use client';


export interface CourseCardData {
  id: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  platformName: string;
  platformLogo?: string;
  views: number;
  likes: number;
  url?: string;
}

export interface CourseCardProps {
  course: CourseCardData;
  onClick?: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      <div className="aspect-video bg-slate-100 relative overflow-hidden">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
            <span className="text-4xl">🎓</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          {course.platformLogo && (
            <img
              src={course.platformLogo}
              alt=""
              className="w-5 h-5 rounded object-contain flex-shrink-0 border border-slate-100"
            />
          )}
          <span className="text-xs text-slate-600 font-medium">{course.platformName}</span>
        </div>
        <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 group-hover:text-amber-700 transition-colors mb-2">
          {course.title}
        </h4>
        {course.summary && (
          <p className="text-xs text-slate-500 line-clamp-2">{course.summary}</p>
        )}
      </div>
    </div>
  );
}
