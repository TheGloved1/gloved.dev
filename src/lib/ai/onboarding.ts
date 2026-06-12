const shouldPopulateOnboardingThreads = false;

export const onboardingCheck = async () => {
  if (shouldPopulateOnboardingThreads) {
    console.log('[CHAT] Onboarding is disabled');
  } else {
    console.log('[CHAT] Onboarding is disabled');
  }
};
