const DEFAULT_SHORTCUT = ']';

const shortcutInput = document.getElementById('shortcut');
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');

// Load current shortcut
chrome.storage.sync.get(['githubSidebarShortcut'], (result) => {
  shortcutInput.value = result.githubSidebarShortcut || DEFAULT_SHORTCUT;
});

// Capture keypress
shortcutInput.addEventListener('keydown', (e) => {
  e.preventDefault();
  shortcutInput.value = e.key;
});

// Save shortcut
saveButton.addEventListener('click', () => {
  const shortcut = shortcutInput.value;
  chrome.storage.sync.set({ githubSidebarShortcut: shortcut }, () => {
    statusDiv.textContent = 'Saved!';
    setTimeout(() => {
      statusDiv.textContent = '';
    }, 2000);
  });
});
