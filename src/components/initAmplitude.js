let amplitude;

export default function initAmplitude(shopOrigin) {
  // due to constraints with useEffect and rerenders, this is my little hack to make sure amplitude is only initialized once per client
  if (process.browser && shopOrigin && !amplitude) {
    amplitude = require("amplitude-js");
    amplitude
      .getInstance()
      .init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY, shopOrigin, {
        disableCookies: true,
        sameSiteCookie: "Strict",
      });
    amplitude.getInstance().setUserId(shopOrigin);
  }

  return amplitude;
}

export const setAmplitudeUserId = (userId) => {
  if (process.browser && amplitude) {
    amplitude.getInstance().setUserId(userId);
  }
};

export const amplitudeEvent = (name, params = {}) => {
  if (window && amplitude) {
    amplitude.getInstance().logEvent(name, params);
  }
};
