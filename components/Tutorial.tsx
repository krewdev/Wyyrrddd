import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './Icons';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  position: 'center' | 'top' | 'bottom';
  highlight?: string; // CSS selector to highlight
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Wyyrrddd',
    description: 'The cyberpunk social network where your data has value. Connect your wallet to start earning and spending tokens!',
    icon: '🚀',
    position: 'center'
  },
  {
    id: 'wallet',
    title: 'Connect Your Wallet',
    description: 'Link your Polkadot wallet to participate in the economy. Earn LIKE, LOVE, CARE, and CREEP tokens through social interactions.',
    icon: '👛',
    position: 'center'
  },
  {
    id: 'feed',
    title: 'Explore the Feed',
    description: 'Browse posts from the network. Like, love, care, or creep on content - each interaction costs DOT tokens but builds reputation.',
    icon: '📱',
    position: 'center',
    highlight: '[data-tutorial="feed"]'
  },
  {
    id: 'camera',
    title: 'Create Content',
    description: 'Use the camera to capture moments with cyberpunk filters, stickers, and effects. Share your unique perspective!',
    icon: '📸',
    position: 'center',
    highlight: '[data-tutorial="camera"]'
  },
  {
    id: 'radar',
    title: 'Find Opportunities',
    description: 'Check the Radar for nearby sponsored locations. Visit them to earn tokens and support local businesses.',
    icon: '📡',
    position: 'center',
    highlight: '[data-tutorial="radar"]'
  },
  {
    id: 'profile',
    title: 'Manage Your Profile',
    description: 'View your token balances, reputation score, and data selling preferences. Customize your cyber identity.',
    icon: '👤',
    position: 'center',
    highlight: '[data-tutorial="profile"]'
  },
  {
    id: 'tokens',
    title: 'Token Economy',
    description: 'LIKE costs 0.002 DOT, LOVE costs 0.01 DOT, CARE costs 0.05 DOT, CREEP costs 0.25 DOT. Earn tokens by receiving interactions!',
    icon: '💎',
    position: 'center'
  }
];

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      onClose();
    }, 300);
  };

  const skipTutorial = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={skipTutorial}
      />

      {/* Highlight overlay for specific elements */}
      {step.highlight && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-black/60" />
          <style jsx>{`
            ${step.highlight} {
              position: relative;
              z-index: 60;
              animation: cyber-pulse 2s infinite;
            }
            ${step.highlight}::before {
              content: '';
              position: absolute;
              inset: -8px;
              border: 2px solid #00F0FF;
              border-radius: 12px;
              animation: cyber-pulse 2s infinite;
              pointer-events: none;
            }
          `}</style>
        </div>
      )}

      {/* Tutorial Modal */}
      <div
        className={`fixed z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${
          step.position === 'center'
            ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
            : step.position === 'top'
            ? 'top-8 left-1/2 transform -translate-x-1/2'
            : 'bottom-8 left-1/2 transform -translate-x-1/2'
        }`}
      >
        <div className="bg-cyber-panel/95 backdrop-blur-xl border border-cyber-cyan/50 rounded-2xl p-6 max-w-sm mx-4 shadow-[0_0_40px_rgba(0,240,255,0.3)]">
          {/* Close button */}
          <button
            onClick={skipTutorial}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="text-6xl text-center mb-4 animate-bounce-gentle">
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white text-center mb-3 font-mono tracking-wide">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-gray-300 text-center text-sm leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Progress indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-cyber-cyan shadow-[0_0_10px_rgba(0,240,255,0.8)]'
                    : index < currentStep
                    ? 'bg-cyber-green'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                currentStep === 0
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-cyber-cyan hover:text-white hover:bg-cyber-cyan/20'
              }`}
            >
              Previous
            </button>

            <span className="text-xs text-gray-500 font-mono">
              {currentStep + 1} / {tutorialSteps.length}
            </span>

            <button
              onClick={nextStep}
              className="px-4 py-2 text-sm font-bold bg-cyber-cyan text-black rounded-lg hover:bg-cyber-cyan/80 transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>

          {/* Skip button */}
          <button
            onClick={skipTutorial}
            className="w-full mt-3 text-xs text-gray-500 hover:text-gray-400 transition-colors"
          >
            Skip Tutorial
          </button>
        </div>
      </div>
    </>
  );
};

// Tutorial trigger component
export const TutorialTrigger: React.FC<{
  showTutorial: () => void;
  className?: string;
}> = ({ showTutorial, className = '' }) => (
  <button
    onClick={showTutorial}
    className={`px-3 py-1 text-xs bg-cyber-dim/50 border border-cyber-cyan/30 text-cyber-cyan rounded hover:bg-cyber-cyan/10 transition-all ${className}`}
  >
    ?
  </button>
);
