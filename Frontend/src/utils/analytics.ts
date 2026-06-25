/**
 * Local Shop Hyperlocal Analytics Event Tracker.
 * Simulated event dispatcher with visual logging mechanisms.
 */
export type AnalyticsEventName =
  | 'HOME_BANNER_CLICK'
  | 'CATEGORY_CLICK'
  | 'STORE_CLICK'
  | 'PRODUCT_CLICK'
  | 'ADD_TO_CART'
  | 'COUPON_COPY'
  | 'SEARCH_CLICK';

export const trackAnalyticsEvent = (
  eventName: AnalyticsEventName,
  details?: Record<string, unknown>
): void => {
  const timestamp = new Date().toISOString();
  
  // Console logging with custom styling
  console.log(
    `%c[Analytics Tracker] Event: ${eventName} %c${JSON.stringify(details)}`,
    'color: #1A56DB; font-weight: bold; background: #EBF5FF; padding: 2px 4px; rounded: 4px;',
    'color: #4B5563;'
  );

  // In a real application, this would trigger an API call or dispatch to Google Analytics/Mixpanel:
  // mixpanel.track(eventName, { ...details, timestamp });
};

export default trackAnalyticsEvent;
