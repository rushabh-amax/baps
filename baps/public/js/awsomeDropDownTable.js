
// Patch Awesomplete positioning inside scrollable grids
$(document).on('awesomplete-open', function () {
  const input = document.activeElement;
  if (!input || !input.className.includes('awesomplete')) return;

  const dropdown = document.querySelector('.awesomplete ul');
  if (!dropdown) return;

  // Recalculate position relative to input
  const rect = input.getBoundingClientRect();
  const gridBody = input.closest('.grid-body') || input.closest('.form-grid-container');

  // If inside a scrollable container, adjust for its scroll
  const scrollTop = gridBody ? gridBody.scrollTop : window.pageYOffset;

  Object.assign(dropdown.style, {
    position: 'absolute',
    top: `${rect.bottom + scrollTop}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
    maxHeight: '300px',
    overflowY: 'auto',
    border:'1px solid   ',
    boxSizing: 'border-box'
  });

  // Append to body to escape overflow clipping
  if (dropdown.parentNode !== document.body) {
    document.body.appendChild(dropdown);
  }
});