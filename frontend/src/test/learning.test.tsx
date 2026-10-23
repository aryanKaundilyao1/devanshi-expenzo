import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LEARNING_TOPICS } from '@/features/learning/content/topicsData';
import { useLearningStore } from '@/features/learning/store/useLearningStore';
import { LearningHubPage } from '@/features/learning/pages/LearningHubPage';
import { TopicArticlePage } from '@/features/learning/pages/TopicArticlePage';

describe('Phase 7E: Financial Learning Academy & Interactive Quizzes', () => {
  beforeEach(() => {
    const store = useLearningStore.getState();
    store.setPersona('professional');
    localStorage.clear();
  });

  it('validates comprehensive topic catalog with substantive content and quizzes', () => {
    expect(LEARNING_TOPICS.length).toBeGreaterThanOrEqual(6);

    const slugs = LEARNING_TOPICS.map((t) => t.slug);
    expect(slugs).toContain('personal-budgeting');
    expect(slugs).toContain('emergency-funds');
    expect(slugs).toContain('mutual-funds-and-sips');
    expect(slugs).toContain('power-of-compounding');
    expect(slugs).toContain('inflation-and-real-returns');
    expect(slugs).toContain('financial-fraud-awareness');

    LEARNING_TOPICS.forEach((t) => {
      expect(t.title).toBeTruthy();
      expect(t.keyTakeaways.length).toBeGreaterThanOrEqual(2);
      expect(t.contentSections.length).toBeGreaterThanOrEqual(1);
      expect(t.glossary.length).toBeGreaterThanOrEqual(1);
      expect(t.quiz.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('manages bookmarks, completion, and quiz scores with persona isolation', () => {
    const store = useLearningStore.getState();

    // 1. Bookmark toggle
    store.toggleBookmark('personal-budgeting');
    expect(useLearningStore.getState().bookmarkedSlugs).toContain('personal-budgeting');

    store.toggleBookmark('personal-budgeting');
    expect(useLearningStore.getState().bookmarkedSlugs).not.toContain('personal-budgeting');

    // 2. Quiz scoring
    store.recordQuizScore('personal-budgeting', 2, 2);
    const scoreRecord = useLearningStore.getState().quizScores['personal-budgeting'];
    expect(scoreRecord).toBeDefined();
    expect(scoreRecord.score).toBe(2);
    expect(scoreRecord.passed).toBe(true);
    expect(useLearningStore.getState().completedSlugs).toContain('personal-budgeting');

    // 3. Persona isolation
    store.setPersona('student');
    // Student persona must start clean
    expect(useLearningStore.getState().completedSlugs).not.toContain('personal-budgeting');

    // Switch back to professional
    store.setPersona('professional');
    expect(useLearningStore.getState().completedSlugs).toContain('personal-budgeting');
  });

  it('renders Learning Academy homepage with search and lesson cards', () => {
    render(
      <MemoryRouter>
        <LearningHubPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Financial Learning Academy/i)).toBeInTheDocument();
    expect(screen.getByText(/Personal Budgeting & The 50\/30\/20 Rule/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search financial topics/i)).toBeInTheDocument();
  });

  it('renders Topic Article page with takeaways, glossary and interactive quiz', () => {
    render(
      <MemoryRouter initialEntries={['/app/learning/topics/personal-budgeting']}>
        <Routes>
          <Route path="/app/learning/topics/:slug" element={<TopicArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Personal Budgeting & The 50\/30\/20 Rule/i)).toBeInTheDocument();
    expect(screen.getByText(/Core Takeaways/i)).toBeInTheDocument();
    expect(screen.getByText(/Essential Financial Glossary/i)).toBeInTheDocument();
    expect(screen.getByText(/Knowledge Check Quiz/i)).toBeInTheDocument();
    expect(screen.getByText(/Under the 50\/30\/20 rule, what percentage of monthly income/i)).toBeInTheDocument();
  });

  it('handles unknown topic slugs with a clean not-found state', () => {
    render(
      <MemoryRouter initialEntries={['/app/learning/topics/unknown-crypto-scheme']}>
        <Routes>
          <Route path="/app/learning/topics/:slug" element={<TopicArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Lesson Not Found/i)).toBeInTheDocument();
  });
});

