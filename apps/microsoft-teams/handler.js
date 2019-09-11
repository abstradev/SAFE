module.exports = (SafeHandler) => {
  const useragent = 'Mozilla/5.0 (X11; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0';
  SafeHandler.setUserAgent(useragent);
}
