const DEFAULT_SHORTCUT = ']';
let shortcut = DEFAULT_SHORTCUT;
let sidebarHidden = false;

// Load shortcut from storage
chrome.storage.sync.get(['githubSidebarShortcut'], (result) => {
  shortcut = result.githubSidebarShortcut || DEFAULT_SHORTCUT;
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.githubSidebarShortcut) {
    shortcut = changes.githubSidebarShortcut.newValue;
  }
});

// Find the sidebar element
function getSidebar() {
  // Try multiple possible selectors
  const selectors = [
    '.Layout-sidebar',
    '[data-target="pull-request-sidebar"]',
    '.discussion-sidebar',
    'aside.BorderGrid-cell',
    '.js-discussion-sidebar'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log('Disbarred: Found sidebar with selector:', selector);
      return element;
    }
  }
  
  console.log('Disbarred: No sidebar found. Available elements:', {
    layoutSidebar: document.querySelectorAll('.Layout-sidebar').length,
    borderGrid: document.querySelectorAll('.BorderGrid-cell').length,
    discussionSidebar: document.querySelectorAll('.discussion-sidebar').length
  });
  
  return null;
}

// Toggle sidebar visibility
function toggleSidebar() {
  const sidebar = getSidebar();
  if (!sidebar) return;

  sidebarHidden = !sidebarHidden;
  sidebar.style.display = sidebarHidden ? 'none' : '';
}

// Listen for keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Don't trigger if user is typing in an input/textarea
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }

  if (e.key === shortcut) {
    e.preventDefault();
    toggleSidebar();
  }
});
