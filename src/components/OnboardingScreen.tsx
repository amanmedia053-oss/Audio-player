import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, History, Heart, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { AppConfig } from '../types';

interface OnboardingScreenProps {
  onComplete: () => void;
  appName: string;
  appConfig: AppConfig;
  loading?: boolean;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, appName, appConfig, loading }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: appConfig.onboarding_step1_title,
      desc: appConfig.onboarding_step1_desc.includes('{appName}')
        ? appConfig.onboarding_step1_desc.replace('{appName}', appName)
        : `${appName} ${appConfig.onboarding_step1_desc}`,
      icon: <Compass className="w-16 h-16 text-[#ffb900]" />,
      accent: 'from-[#ffb900]/20 to-transparent',
      badge: appConfig.onboarding_step1_badge,
    },
    {
      title: appConfig.onboarding_step2_title,
      desc: appConfig.onboarding_step2_desc,
      icon: <History className="w-16 h-16 text-[#ffb900]" />,
      accent: 'from-[#ffb900]/20 to-transparent',
      badge: appConfig.onboarding_step2_badge,
    },
    {
      title: appConfig.onboarding_step3_title,
      desc: appConfig.onboarding_step3_desc,
      icon: <Heart className="w-16 h-16 text-red-500 fill-red-500/10" />,
      accent: 'from-red-500/15 to-transparent',
      badge: appConfig.onboarding_step3_badge,
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div
      id="onboarding-screen-container"
      className="fixed inset-0 bg-[#0f0f11] z-[9998] flex flex-col items-center justify-between py-12 px-5 sm:px-8 overflow-hidden select-none"
    >
      {/* Dynamic Background Glow representing active step */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-80 h-80 rounded-full transition-all duration-1000 bg-gradient-to-tr ${steps[currentStep].accent} blur-[120px] opacity-40`} />
      </div>

      {/* Top Bar with App Name and Skip button */}
      <div className="w-full max-w-lg flex items-center justify-between z-10">
        {loading ? (
          <div className="h-6 w-32 shimmer-element rounded-lg" />
        ) : (
          <span className="text-[#ffb900] font-black text-lg tracking-tight font-sans">
            {appName}
          </span>
        )}
        <button
          id="skip-onboarding-btn"
          onClick={onComplete}
          className="text-xs font-bold text-[#c7c6ca]/60 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/5 transition-all cursor-pointer"
        >
          {appConfig.onboarding_btn_skip || "تېرېدل (Skip)"}
        </button>
      </div>

      {/* Slide Carousel Area with AnimatePresence */}
      <div className="w-full max-w-lg flex-grow flex items-center justify-center relative my-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full bg-[#16151a] border border-[#2d2c30]/50 rounded-[32px] p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            {loading ? (
              /* Shimmer skeleton for onboarding text content while fetching online for first time */
              <div className="flex flex-col items-center w-full">
                <div className="h-5 w-28 shimmer-element rounded-full mb-6" />
                <div className="w-32 h-32 rounded-3xl bg-[#1e1d23] border border-[#2d2c30] flex items-center justify-center mb-8 shadow-inner relative">
                  <div className="w-16 h-16 rounded-2xl shimmer-element opacity-50" />
                </div>
                <div className="h-8 w-56 sm:w-72 shimmer-element rounded-xl mb-4" />
                <div className="space-y-2 w-full max-w-sm flex flex-col items-center">
                  <div className="h-4 w-full shimmer-element rounded-md" />
                  <div className="h-4 w-4/5 shimmer-element rounded-md" />
                </div>
              </div>
            ) : (
              <>
                {/* Top Badge */}
                <span className="text-[10px] font-bold tracking-wider text-[#ffb900] bg-[#ffb900]/10 border border-[#ffb900]/15 px-3 py-1 rounded-full uppercase mb-6">
                  {steps[currentStep].badge}
                </span>

                {/* Icon Wrapper with bounce-in effect */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.1 }}
                  className="w-32 h-32 rounded-3xl bg-[#1e1d23] border border-[#2d2c30] flex items-center justify-center mb-8 shadow-inner relative"
                >
                  <div className="absolute inset-0 bg-radial from-[#ffb900]/5 to-transparent rounded-3xl" />
                  {steps[currentStep].icon}
                </motion.div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-3">
                  {steps[currentStep].title}
                </h2>

                {/* Description Paragraph */}
                <p className="text-sm text-[#c7c6ca]/80 leading-relaxed font-medium max-w-sm">
                  {steps[currentStep].desc}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls & Dot Indicators Footer */}
      <div className="w-full max-w-lg flex flex-col items-center gap-6 z-10">
        
        {/* Progress dots */}
        <div className="flex gap-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              id={`progress-dot-${idx}`}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6 bg-[#ffb900]' : 'w-2 bg-[#2d2c30] hover:bg-[#8e8d91]'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Buttons Row */}
        <div className="w-full flex items-center justify-between gap-4">
          {/* Previous Button (Hidden or disabled on step 0) */}
          {currentStep > 0 ? (
            <button
              id="prev-onboarding-btn"
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold border border-white/5 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>{appConfig.onboarding_btn_prev || "شاته"}</span>
            </button>
          ) : (
            <div className="w-[84px]" /* Empty placeholder for balance */ />
          )}

          {/* Next / Complete Button */}
          <button
            id="next-onboarding-btn"
            onClick={handleNext}
            className={`flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg cursor-pointer ${
              currentStep === steps.length - 1
                ? 'bg-[#ffb900] text-black hover:bg-[#ffc933] shadow-[#ffb900]/15'
                : 'bg-white text-black hover:bg-white/90 shadow-white/5'
            }`}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <span>{appConfig.onboarding_btn_start || "پيل کړئ (Get Started)"}</span>
                <Check className="w-4 h-4 text-black stroke-[3px]" />
              </>
            ) : (
              <>
                <span>{appConfig.onboarding_btn_next || "بل پړاو"}</span>
                <ChevronLeft className="w-4 h-4 text-black stroke-[3px]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
