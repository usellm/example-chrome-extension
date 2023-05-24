import React, { useState, useEffect } from "react";
import useLLM from "usellm";

function Home() {
  const [summary, setSummary] = useState("");
  const [processing, setProcessing] = useState(false);

  const llm = useLLM({ serviceUrl: "https://usellm.org/api/llm" });

  const getCurrenTab = async () => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  };
  const sendMessage = async (type, message = {}) => {
    const tab = await getCurrenTab();
    return chrome.tabs.sendMessage(tab.id, { type, ...message });
  };

  const onClick = async () => {
    const { article } = await sendMessage("get_content");
    setProcessing(true);

    try {
      await llm.chat({
        stream: true,
        messages: [
          { role: "user", content: article.textContent.slice(0, 3000) },
          { role: "user", content: "Summarize" },
        ],
        onStream: ({ message, isLast }) => {
          setSummary(message.content);
          if (isLast) {
            setProcessing(false);
            sendMessage("set_summary", { summary: message.content });
          }
        },
      });
    } catch (e) {
      console.error(e);
      setProcessing(false);
    }
  };

  useEffect(async () => {
    const { summary } = await sendMessage("get_cache");
    if (summary) setSummary(summary);
  }, []);

  return (
    <main className="flex min-h-screen w-96 flex-col items-center justify-between p-4">
      <div>
        <button
          type="button"
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          onClick={onClick}
          disabled={processing}
        >
          {processing ? "Summarizing..." : "Summarize"}
        </button>
      </div>
      <div className="prose mt-8 w-full">{summary}</div>
    </main>
  );
}

export default Home;
