import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LEARNING_TOPICS } from '@/features/learning/content/topicsData';
import { useLearningStore } from '@/features/learning/store/useLearningStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  GraduationCap,
  Search,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';

export const LearningHubPage: React.FC = () => {
  const { user } = useFinanceStore();
  const {
    activePersona,
    bookmarkedSlugs,
    completedSlugs,
    quizScores,
    toggleBookmark,
    setPersona,
  } = useLearningStore();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // Sync persona with user profile
  useEffect(() => {
    if (user?.persona && user.persona !== activePersona) {
      setPersona(user.persona);
    }
  }, [user?.persona, activePersona, setPersona]);

  const filteredTopics = useMemo(() => {
    return LEARNING_TOPICS.filter((topic) => {
      const matchSearch =
        topic.title.toLowerCase().includes(search.toLowerCase()) ||
        topic.summary.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'all' || topic.category === categoryFilter;
      const matchLevel = levelFilter === 'all' || topic.level === levelFilter;
      const matchBookmark = !showBookmarkedOnly || bookmarkedSlugs.includes(topic.slug);
      return matchSearch && matchCat && matchLevel && matchBookmark;
    });
  }, [search, categoryFilter, levelFilter, showBookmarkedOnly, bookmarkedSlugs]);

  const completionPercent =
    LEARNING_TOPICS.length > 0 ? (completedSlugs.length / LEARNING_TOPICS.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Financial Learning Academy
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              {LEARNING_TOPICS.length} lessons available
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build financial literacy: budgeting fundamentals, index funds, SIPs, compounding, and fraud prevention
          </p>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
          <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <span>Your Academy Progress:</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {completedSlugs.length} / {LEARNING_TOPICS.length} Completed
              </span>
            </div>
            <div className="h-1.5 w-36 rounded-full bg-slate-100 dark:bg-slate-800 mt-1 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search financial topics (e.g. SIP, Compounding, Inflation)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="budgeting">Personal Budgeting</option>
              <option value="savings">Savings & Buffers</option>
              <option value="investing">Investing & Markets</option>
              <option value="security">Digital Security</option>
            </select>
          </div>

          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Skill Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowBookmarkedOnly((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-colors ${
              showBookmarkedOnly
                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${showBookmarkedOnly ? 'fill-current' : ''}`} />
            <span>Show Bookmarked ({bookmarkedSlugs.length})</span>
          </button>

          <span className="text-[11px] text-slate-400">
            Showing {filteredTopics.length} of {LEARNING_TOPICS.length} topics
          </span>
        </div>
      </div>

      {/* Topics Cards Grid */}
      {filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => {
            const isBookmarked = bookmarkedSlugs.includes(topic.slug);
            const isCompleted = completedSlugs.includes(topic.slug);
            const quizRecord = quizScores[topic.slug];

            return (
              <div
                key={topic.slug}
                className="group rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition-all text-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {topic.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {topic.level}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleBookmark(topic.slug)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isBookmarked
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                          : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Topic'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <Link
                    to={`/app/learning/topics/${topic.slug}`}
                    className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block mt-2"
                  >
                    {topic.title}
                  </Link>

                  <p className="text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                    {topic.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {topic.readingTimeMinutes} min read
                    </span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/app/learning/topics/${topic.slug}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-750 transition-colors"
                  >
                    <span>Read Lesson & Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Lessons Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting your search query or removing category/level filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategoryFilter('all');
              setLevelFilter('all');
              setShowBookmarkedOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

