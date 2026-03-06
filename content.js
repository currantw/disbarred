const DEFAULT_SHORTCUT = ']';
let shortcut = DEFAULT_SHORTCUT;
let rightSidebarHidden = false;
let leftSidebarHidden = false;

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

// Toggle right sidebar (Conversation tab)
function toggleRightSidebar() {
  const sidebar = document.querySelector('.prc-PageLayout-PaneWrapper-pHPop[data-position="end"]');
  const mainContent = document.querySelector('.prc-PageLayout-PaneWrapper-pHPop[data-position="start"]');
  if (!sidebar) return;

  rightSidebarHidden = !rightSidebarHidden;
  sidebar.style.display = rightSidebarHidden ? 'none' : '';
  if (mainContent) {
    mainContent.style.maxWidth = rightSidebarHidden ? '100%' : '';
  }
}

// Toggle left sidebar (Files changed tab)
function toggleLeftSidebar() {
  const sidebar = document.querySelector('.prc-PageLayout-PaneWrapper-pHPop[data-position="start"]');
  if (!sidebar) return;

  leftSidebarHidden = !leftSidebarHidden;
  sidebar.style.display = leftSidebarHidden ? 'none' : '';
}

// Listen for keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Don't trigger if user is typing in an input/textarea
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }

  if (e.key === ']') {
    e.preventDefault();
    toggleRightSidebar();
  } else if (e.key === '[') {
    e.preventDefault();
    toggleLeftSidebar();
  }
});
