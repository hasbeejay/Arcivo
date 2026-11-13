// Arcivo Content Script: extracts DOM metadata directly from the webpage

function extractPageMetadata() {
  const getMeta = (prop: string) => 
    document.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') ||
    document.querySelector(`meta[name="${prop}"]`)?.getAttribute('content');

  return {
    title: getMeta('og:title') || document.title,
    description: getMeta('og:description') || getMeta('description') || '',
    image: getMeta('og:image') || '',
    canonicalUrl: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || window.location.href,
  };
}

// Respond to popup queries
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'GET_DOM_METADATA') {
    sendResponse(extractPageMetadata());
  }
});

