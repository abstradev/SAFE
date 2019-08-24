const path = require('path');

module.exports = (SafeHandler) => {
  const getMessages = function getMessages() {
    const count = document.querySelectorAll('.p-channel_sidebar__channel--unread:not(.p-channel_sidebar__channel--muted)').length;
    SafeHandler.setBadgeCount(count);
  };
  SafeHandler.setLoop(getMessages);

  //Disable Banner
  SafeHandler.applyCSS(path.join(__dirname, 'custom.css'));
};
