let siteConfigs = {};
let customShortcuts = {};
const sidebarStates = {};

// Load configurations
Promise.all([
  fetch(chrome.runtime.getURL('sites.json')).then(r => r.json()),
  chrome.storage.sync.get(['customShortcuts'])
]).then(([configs, storage]) => {
  siteConfigs = configs;
  customShortcuts = storage.customShortcuts || {};
  bindShortcuts();
});

// Listen for shortcut changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.customShortcuts) {
    customShortcuts = changes.customShortcuts.newValue || {};
    Mousetrap.reset();
    bindShortcuts();
  }
});

function getShortcut(hostname, position) {
  const key = `${hostname}.${position}`;
  return customShortcuts[key] || siteConfigs[hostname]?.sidebars[position]?.shortcut;
}

function toggleSidebar(position, config) {
  const element = document.querySelector(config.selector);
  if (!element) return;

  const key = `${window.location.hostname}-${position}`;
  sidebarStates[key] = !sidebarStates[key];
  
  element.style.display = sidebarStates[key] ? 'none' : '';
  
  if (config.expandMainContent && config.mainContentSelector) {
    const mainContent = document.querySelector(config.mainContentSelector);
    if (mainContent) mainContent.style.maxWidth = sidebarStates[key] ? '100%' : '';
  }
}

function bindShortcuts() {
  const hostname = window.location.hostname;
  const siteConfig = siteConfigs[hostname];
  if (!siteConfig) return;

  for (const [position, config] of Object.entries(siteConfig.sidebars)) {
    const shortcut = getShortcut(hostname, position);
    Mousetrap.bind(shortcut, (e) => {
      e.preventDefault();
      toggleSidebar(position, config);
      return false;
    });
  }
}
