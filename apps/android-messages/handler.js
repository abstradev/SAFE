module.exports = (SafeHandler) => {
  function getMessages() {
    const count = document.querySelectorAll('.text-content.unread').length;
    SafeHandler.setBadgeCount(count);
  }
  SafeHandler.setLoop(getMessages);
};
