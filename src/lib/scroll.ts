export function resetScrollPosition(): void {
  const main = document.querySelector('main');
  if (main) main.scrollTop = 0;
  window.scrollTo(0, 0);
}
