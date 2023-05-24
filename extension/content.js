const cache = {};

const getArticle = () => {
  const documentClone = document.cloneNode(true);
  const article = new Readability(documentClone).parse();
  return article;
};

const updateArticle = () => {
  if ("article" in cache) {
    return cache.article;
  }

  const article = getArticle();
  cache.article = article;
  return article;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "get_cache") {
    sendResponse(cache);
  } else if (message.type === "get_content") {
    updateArticle();
    sendResponse(cache);
  } else if (message.type === "set_summary") {
    cache.summary = message.summary;
  }
});
