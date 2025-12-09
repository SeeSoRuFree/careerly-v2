import * as React from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { DiscoverMinimalCard, DiscoverMinimalCardProps } from './discover-minimal-card';
import { X, Heart, RotateCcw } from 'lucide-react';
import { Button } from './button';

interface SwipeDeckProps {
    cards: DiscoverMinimalCardProps[];
    onSwipeLeft: (card: DiscoverMinimalCardProps) => void;
    onSwipeRight: (card: DiscoverMinimalCardProps) => void;
}

export function SwipeDeck({ cards, onSwipeLeft, onSwipeRight }: SwipeDeckProps) {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

    // If no more cards
    if (currentIndex >= cards.length) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900">All caught up!</h3>
                <p className="text-slate-500 max-w-xs">
                    You&apos;ve reviewed all the recommendations for now. Check back later for more.
                </p>
                <Button onClick={() => setCurrentIndex(0)} variant="outline">
                    Start Over
                </Button>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    const handleSwipe = (direction: 'left' | 'right') => {
        if (direction === 'left') {
            onSwipeLeft(currentCard);
        } else {
            onSwipeRight(currentCard);
        }
        setCurrentIndex(prev => prev + 1);
    };

    return (
        <div className="relative w-full max-w-md mx-auto h-[600px] flex flex-col items-center justify-center">
            {/* Card Stack */}
            <div className="relative w-full h-full">
                {/* Next Card (Background) */}
                {currentIndex + 1 < cards.length && (
                    <div className="absolute top-4 left-0 right-0 scale-95 opacity-50 pointer-events-none transform translate-y-4">
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 h-[500px] shadow-sm overflow-hidden">
                            <div className="w-full h-48 bg-slate-100 rounded-xl mb-4" />
                            <div className="space-y-3">
                                <div className="h-6 bg-slate-100 rounded w-3/4" />
                                <div className="h-4 bg-slate-100 rounded w-full" />
                                <div className="h-4 bg-slate-100 rounded w-5/6" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Current Card (Draggable) */}
                <motion.div
                    key={currentCard.title} // Unique key for animation
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipeThreshold = 100;
                        if (offset.x > swipeThreshold) {
                            handleSwipe('right');
                        } else if (offset.x < -swipeThreshold) {
                            handleSwipe('left');
                        }
                    }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="absolute top-0 left-0 right-0 cursor-grab active:cursor-grabbing z-10"
                >
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden h-[550px] flex flex-col">
                        {/* Image Area */}
                        <div className="h-64 bg-slate-100 relative">
                            {currentCard.thumbnailUrl ? (
                                <img src={currentCard.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                    {currentCard.badge || 'Recommendation'}
                                </span>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-medium uppercase tracking-wide">
                                {currentCard.sources?.[0]?.name} • {currentCard.stats.likes} Likes
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3 leading-tight">
                                {currentCard.title}
                            </h2>
                            <p className="text-slate-600 line-clamp-4 leading-relaxed">
                                {currentCard.summary}
                            </p>

                            <div className="mt-auto pt-4 flex flex-wrap gap-2">
                                {currentCard.tags?.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded-md">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6 mt-8 z-20">
                <button
                    onClick={() => handleSwipe('left')}
                    className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                >
                    <X className="w-6 h-6" />
                </button>
                <button
                    onClick={() => handleSwipe('right')}
                    className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-teal-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all"
                >
                    <Heart className="w-6 h-6 fill-current" />
                </button>
            </div>
        </div>
    );
}
