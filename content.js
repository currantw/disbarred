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
  
  // Find the grid/flex container and force it to single column
  let container = element.parentElement;
  while (container && container !== document.body) {
    const style = getComputedStyle(container);
    if (style.display === 'grid') {
      container.style.gridTemplateColumns = sidebarStates[key] ? '1fr' : '';
      break;
    }
    if (style.display === 'flex') {
      container.style.flexDirection = sidebarStates[key] ? 'column' : '';
      break;
    }
    container = container.parentElement;
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
