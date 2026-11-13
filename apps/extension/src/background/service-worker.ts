// Arcivo Extension Service Worker (Manifest V3)

console.log('[Arcivo Extension] Background Service Worker initialized.');

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'PING') {
    sendResponse({ status: 'PONG', version: '1.0.0' });
    return true;
  }

  if (request.type === 'SAVE_RESOURCE') {
    console.log('[Arcivo Extension] Saving resource:', request.payload);
    // Background dispatch to Arcivo REST API
    sendResponse({ success: true, timestamp: new Date().toISOString() });
    return true;
  }
});

