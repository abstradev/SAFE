module.exports = (SafeHandler) => {
  const getMessages = function getMessages() {
    const count = document.querySelectorAll('.badge-count:not(.ng-hide)').length;
    SafeHandler.setBadgeCount(count);
  };

  SafeHandler.setLoop(getMessages);
};
