const items = document.querySelectorAll('.menu-item');
let current = 0;

function updateMenu() {
  items.forEach((item, index) => {
    item.classList.toggle('active', index === current);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    current = (current + 1) % items.length;
    updateMenu();
  }

  if (e.key === 'ArrowUp') {
    current = (current - 1 + items.length) % items.length;
    updateMenu();
  }
});
