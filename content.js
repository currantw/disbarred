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

// Toggle sidebar visibility
function toggleSidebar() {
  const sidebar = document.querySelector('.prc-PageLayout-PaneWrapper-pHPop[data-position="end"]');
  const mainContent = document.querySelector('.prc-PageLayout-PaneWrapper-pHPop[data-position="start"]');
  if (!sidebar) return;

  sidebarHidden = !sidebarHidden;
  sidebar.style.display = sidebarHidden ? 'none' : '';
  if (mainContent) {
    mainContent.style.maxWidth = sidebarHidden ? '100%' : '';
  }
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
