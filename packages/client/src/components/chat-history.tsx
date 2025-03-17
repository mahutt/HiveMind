import { useSidebar } from "../providers/sidebar-hook";
import { Search, Languages } from "lucide-react";
import { useState } from "react";

interface ChatEntry {
  id: string;
  title: string;
  date: Date;
}

export default function ChatHistory() {
  const { toggleChatHistory } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");

  const chatHistory: ChatEntry[] = [
    {
      id: "1",
      title:
        "What courses should a first year Software Engineering student take?",
      date: new Date(2025, 2, 17),
    },
    {
      id: "2",
      title: "How do I check my application status?",
      date: new Date(2025, 2, 16),
    },
    {
      id: "3",
      title: "What programs are offered at Concordia?",
      date: new Date(2025, 2, 16),
    },
    {
      id: "4",
      title: "What clubs does Concordia have?",
      date: new Date(2025, 2, 15),
    },
    {
      id: "5",
      title: "How much is tuition?",
      date: new Date(2025, 2, 15),
    },
    {
      id: "6",
      title: "What is the application deadline?",
      date: new Date(2025, 2, 9),
    },
    {
      id: "7",
      title: "Where is Concordia located?",
      date: new Date(2025, 2, 8),
    },
  ];

  const filteredChats = searchQuery
    ? chatHistory.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chatHistory;

  const chatsByDate = filteredChats.reduce(
    (acc: { [key: string]: ChatEntry[] }, chat) => {
      const dateString = chat.date.toDateString();
      if (!acc[dateString]) {
        acc[dateString] = [];
      }
      acc[dateString].push(chat);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(chatsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const getFormattedDate = (dateString: string) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const date = new Date(dateString);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return dateString;
    }
  };

  return (
    <div className="h-full bg-blue-200 flex flex-col">
      <div className="p-2">
        <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent border-none outline-none w-full px-2 py-1 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="h-4"></div>

        {sortedDates.map((dateString) => (
          <div key={dateString} className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-2 px-1 uppercase tracking-wide">
              {getFormattedDate(dateString)}
            </h3>
            {chatsByDate[dateString].map((chat) => (
              <div
                key={chat.id}
                className="bg-white rounded-lg p-2 mb-1 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm h-12 flex items-center"
              >
                <p className="text-sm truncate">{chat.title}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-1 border-t border-gray-200">
        <button className="p-3 flex  w-full h-12">
          <Languages className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
