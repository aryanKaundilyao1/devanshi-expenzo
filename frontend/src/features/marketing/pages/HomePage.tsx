import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { DashboardPreview } from '../components/DashboardPreview';
import { FeatureShowcaseSection } from '../components/FeatureShowcaseSection';
import { AIAssistantShowcase } from '../components/AIAssistantShowcase';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { PersonalizationSection } from '../components/PersonalizationSection';
import { SecuritySection } from '../components/SecuritySection';
import { FinalCTASection } from '../components/FinalCTASection';

export function HomePage() {
  return (
    <div className="space-y-0">
      {/* Section 2: Hero */}
      <HeroSection />

      {/* Section 3: Interactive Dashboard Preview */}
      <DashboardPreview />

      {/* Section 4: Feature Showcases (Expenses, Banking, Investments, AI) */}
      <FeatureShowcaseSection />

      {/* Section 5: AI Assistant Conversation Showcase */}
      <AIAssistantShowcase />

      {/* Section 6: How EXPENZO Works */}
      <HowItWorksSection />

      {/* Section 7: Personalized Finance Profiles */}
      <PersonalizationSection />

      {/* Section 8: Security & Privacy Trust Section */}
      <SecuritySection />

      {/* Section 9: Final Call to Action */}
      <FinalCTASection />
    </div>
  );
}

