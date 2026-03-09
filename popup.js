const container = document.getElementById('settings-container');
const saveButton = document.getElementById('save');
const saveCloseButton = document.getElementById('save-close');

let siteConfigs = {};
let customShortcuts = {};

// Load site configurations
fetch(chrome.runtime.getURL('sites.json'))
  .then(response => response.json())
  .then(configs => {
    siteConfigs = configs;
    return chrome.storage.sync.get(['customShortcuts']);
  })
  .then(result => {
    customShortcuts = result.customShortcuts || {};
    renderSettings();
  });

function keyEventToShortcut(e) {
  const parts = [];
  
  // Add modifiers in consistent order
  if (e.ctrlKey) parts.push('ctrl');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey) parts.push('shift');
  if (e.metaKey) parts.push('mod'); // Mousetrap uses 'mod' for cmd/ctrl
  
  // Add the actual key
  let key = e.key.toLowerCase();
  
  // Handle special keys
  const specialKeys = {
    ' ': 'space',
    'escape': 'esc',
    'arrowup': 'up',
    'arrowdown': 'down',
    'arrowleft': 'left',
    'arrowright': 'right'
  };
  
  if (specialKeys[key]) {
    key = specialKeys[key];
  }
  
  // Don't add modifier keys as the main key
  if (['control', 'alt', 'shift', 'meta'].includes(key)) {
    return null;
  }
  
  parts.push(key);
  return parts.join('+');
}

function renderSettings() {
  container.innerHTML = '';
  
  for (const [hostname, config] of Object.entries(siteConfigs)) {
    const section = document.createElement('div');
    section.className = 'site-section';
    
    const header = document.createElement('div');
    header.className = 'site-header';
    
    if (config.icon) {
      const icon = document.createElement('img');
      icon.className = 'site-icon';
      icon.src = config.icon;
      header.appendChild(icon);
    }
    
    const siteName = document.createElement('div');
    siteName.className = 'site-name';
    siteName.textContent = hostname;
    header.appendChild(siteName);
    
    section.appendChild(header);
    
    for (const [position, sidebarConfig] of Object.entries(config.sidebars)) {
      const row = document.createElement('div');
      row.className = 'shortcut-row';
      
      const label = document.createElement('div');
      label.className = 'shortcut-label';
      label.textContent = `${position} sidebar:`;
      
      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.site = hostname;
      input.dataset.position = position;
      
      const key = `${hostname}.${position}`;
      input.value = customShortcuts[key] || sidebarConfig.shortcut;
      
      input.addEventListener('focus', () => {
        input.classList.add('recording');
        input.value = 'Press keys...';
      });
      
      input.addEventListener('keydown', (e) => {
        e.preventDefault();
        const shortcut = keyEventToShortcut(e);
        if (shortcut) {
          input.value = shortcut;
          input.blur();
        }
      });
      
      input.addEventListener('blur', () => {
        input.classList.remove('recording');
        if (input.value === 'Press keys...' || !input.value) {
          const key = `${input.dataset.site}.${input.dataset.position}`;
          input.value = customShortcuts[key] || siteConfigs[input.dataset.site].sidebars[input.dataset.position].shortcut;
        }
      });
      
      row.appendChild(label);
      row.appendChild(input);
      section.appendChild(row);
    }
    
    container.appendChild(section);
  }
}

saveButton.addEventListener('click', () => {
  const inputs = container.querySelectorAll('input');
  const newShortcuts = {};
  
  inputs.forEach(input => {
    const key = `${input.dataset.site}.${input.dataset.position}`;
    newShortcuts[key] = input.value;
  });
  
  saveButton.classList.add('saved');
  chrome.storage.sync.set({ customShortcuts: newShortcuts }, () => {
    customShortcuts = newShortcuts;
    setTimeout(() => {
      saveButton.classList.remove('saved');
    }, 250);
  });
});

saveCloseButton.addEventListener('click', () => {
  const inputs = container.querySelectorAll('input');
  const newShortcuts = {};
  
  inputs.forEach(input => {
    const key = `${input.dataset.site}.${input.dataset.position}`;
    newShortcuts[key] = input.value;
  });
  
  saveCloseButton.classList.add('saved');
  chrome.storage.sync.set({ customShortcuts: newShortcuts }, () => {
    customShortcuts = newShortcuts;
    setTimeout(() => {
      window.close();
    }, 250);
  });
});
