function poll() {
  postMessage('poll');
  setTimeout('poll()', 2000);
}
poll();
