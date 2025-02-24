// tracingUtils.js
import { PostHog } from "posthog-node";

const phClient = new PostHog(
  'phc_Pph80fx4MphZSlI8xOVZtbJrdl0KKRkntYpByEC47Ng',
  { host: 'https://us.i.posthog.com' }
);

export const withGeminiTracing = (model, options = {}) => {
  const {
    posthogDistinctId,
    posthogTraceId,
    posthogProperties,
    posthogPrivacyMode = false,
    posthogGroups
  } = options;

  return {
    ...model,
    generateContent: async (...args) => {
      const startTime = Date.now();
      
      try {
        // Capture the start of the generation
        phClient.capture({
          distinctId: posthogDistinctId || 'anonymous',
          event: 'gemini_generation_started',
          properties: {
            ...posthogProperties,
            prompt: args[0],
            trace_id: posthogTraceId,
            privacy_mode: posthogPrivacyMode
          },
          groups: posthogGroups
        });

        // Execute the actual generation
        const result = await model.generateContent(...args);

        // Capture successful generation
        phClient.capture({
          distinctId: posthogDistinctId || 'anonymous',
          event: 'gemini_generation_completed',
          properties: {
            ...posthogProperties,
            prompt: args[0],
            duration_ms: Date.now() - startTime,
            trace_id: posthogTraceId,
            privacy_mode: posthogPrivacyMode,
            status: 'success'
          },
          groups: posthogGroups
        });

        return result;
      } catch (error) {
        // Capture failed generation
        phClient.capture({
          distinctId: posthogDistinctId || 'anonymous',
          event: 'gemini_generation_failed',
          properties: {
            ...posthogProperties,
            prompt: args[0],
            duration_ms: Date.now() - startTime,
            trace_id: posthogTraceId,
            privacy_mode: posthogPrivacyMode,
            status: 'error',
            error: error.message
          },
          groups: posthogGroups
        });
        
        throw error;
      }
    }
  };
};

// Clean up PostHog client when needed
export const shutdownPostHog = () => phClient.shutdown();