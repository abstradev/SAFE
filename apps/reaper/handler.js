module.exports = (SafeHandler) => {
  const getTimer = function getTimer() {
    let title = document.title;
    let split = title.split(" - ");
    if (split.length > 1) {
      let timer = split[1];
      SafeHandler.setTimer(timer);
    } else {
      SafeHandler.setTimer();
    }
  };

  SafeHandler.setLoop(getTimer);
};
