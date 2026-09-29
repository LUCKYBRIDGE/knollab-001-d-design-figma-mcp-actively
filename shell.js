(() => {
  const url = new URL(window.location.href);
  if (url.searchParams.get('version') !== '1') {
    url.searchParams.set('version', '1');
    window.history.replaceState(null, '', url);
  }
})();
