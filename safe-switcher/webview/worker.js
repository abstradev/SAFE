function poll() {
  postMessage('poll');
  setTimeout('poll()', 1000);
}
poll();
