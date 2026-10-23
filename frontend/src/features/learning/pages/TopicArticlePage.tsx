import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LEARNING_TOPICS } from '@/features/learning/content/topicsData';
import { useLearningStore } from '@/features/learning/store/useLearningStore';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Check,
  X as XIcon,
} from 'lucide-react';

export const TopicArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    bookmarkedSlugs,
    completedSlugs,
    quizScores,
    toggleBookmark,
    toggleComplete,
    recordQuizScore,
    resetQuizScore,
  } = useLearningStore();

  const topic = LEARNING_TOPICS.find((t) => t.slug === slug);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!topic) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs max-w-lg mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Lesson Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          The requested educational lesson could not be found.
        </p>
        <Link
          to="/app/learning"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Academy
        </Link>
      </div>
    );
  }

  const isBookmarked = bookmarkedSlugs.includes(topic.slug);
  const isCompleted = completedSlugs.includes(topic.slug);
  const savedQuizScore = quizScores[topic.slug];

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    let score = 0;
    topic.quiz.forEach((q) => {
      const selected = selectedAnswers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (selected && selected === correctOption?.id) {
        score++;
      }
    });

    setIsSubmitted(true);
    recordQuizScore(topic.slug, score, topic.quiz.length);
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    resetQuizScore(topic.slug);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/learning"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Academy
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBookmark(topic.slug)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          <button
            onClick={() => toggleComplete(topic.slug)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              isCompleted
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Completed' : 'Mark Completed'}</span>
          </button>
        </div>
      </div>

      {/* Article Container */}
      <article className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 text-xs leading-relaxed">
        {/* Article Header */}
        <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {topic.category}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold text-slate-400">
              {topic.level} Level
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" /> {topic.readingTimeMinutes} min read
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            {topic.title}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {topic.summary}
          </p>
        </div>

        {/* Key Takeaways Box */}
        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200 text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Core Takeaways</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-emerald-950 dark:text-emerald-200">
            {topic.keyTakeaways.map((point, idx) => (
              <li key={idx} className="leading-relaxed">
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Substantive Content Sections */}
        <div className="space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          {topic.contentSections.map((section, idx) => (
            <section key={idx} className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {section.heading}
              </h2>
              <p className="whitespace-pre-line text-xs md:text-sm">
                {section.body}
              </p>
              {section.example && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">
                    Real-World Fintech Example:
                  </span>
                  {section.example}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Glossary Terms */}
        {topic.glossary.length > 0 && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Essential Financial Glossary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topic.glossary.map((term, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {term.term}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                    {term.definition}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Knowledge Check Quiz */}
        {topic.quiz.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Knowledge Check Quiz
                </h3>
              </div>

              {savedQuizScore && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  savedQuizScore.passed
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                }`}>
                  Previous Score: {savedQuizScore.score} / {savedQuizScore.total} ({savedQuizScore.passed ? 'Passed' : 'Needs Review'})
                </span>
              )}
            </div>

            <form onSubmit={handleSubmitQuiz} className="space-y-6">
              {topic.quiz.map((q, qIdx) => (
                <div key={q.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">
                    {qIdx + 1}. {q.question}
                  </span>

                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isSelected = selectedAnswers[q.id] === opt.id;
                      let optionBorder = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900';

                      if (isSubmitted) {
                        if (opt.isCorrect) {
                          optionBorder = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold';
                        } else if (isSelected && !opt.isCorrect) {
                          optionBorder = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';
                        }
                      } else if (isSelected) {
                        optionBorder = 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 font-semibold';
                      }

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectOption(q.id, opt.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${optionBorder}`}
                        >
                          <input
                            type="radio"
                            name={`question_${q.id}`}
                            checked={isSelected}
                            onChange={() => handleSelectOption(q.id, opt.id)}
                            disabled={isSubmitted}
                            className="mt-0.5 accent-emerald-600"
                          />
                          <div className="flex-1">
                            <span>{opt.text}</span>
                            {isSubmitted && (
                              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                {opt.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                {!isSubmitted ? (
                  <button
                    type="submit"
                    disabled={Object.keys(selectedAnswers).length < topic.quiz.length}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    Submit Quiz Answers
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRetryQuiz}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry Knowledge Check
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </article>
    </div>
  );
};

