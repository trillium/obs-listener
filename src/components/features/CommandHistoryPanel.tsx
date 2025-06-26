"use client";

import { useState } from "react";
import clsx from "clsx";
import Button from "../ui/Button";
import RerunButton from "../ui/RerunButton";
import type { CommandHistoryItem } from "@/hooks/useCommandHistory";
import type { LogEntry } from "@/hooks/useLogs";

interface CommandHistoryPanelProps {
  frequentCommands: CommandHistoryItem[];
  recentCommands: CommandHistoryItem[];
  onRunCommand: (command: LogEntry["command"]) => void;
  onClearHistory: () => void;
  isConnected: boolean;
  totalLifetimeExecutions?: number;
  sessionExecutions?: number;
}

export default function CommandHistoryPanel({
  frequentCommands,
  recentCommands,
  onRunCommand,
  onClearHistory,
  isConnected,
  totalLifetimeExecutions = 0,
  sessionExecutions = 0,
}: CommandHistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<"frequent" | "recent">("frequent");

  const currentCommands =
    activeTab === "frequent" ? frequentCommands : recentCommands;

  const formatLastUsed = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Command History
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rerunnable actions from OBS events and manual commands
            </p>
            
            {/* Statistics */}
            <div className="flex items-center space-x-4 mt-2">
              <div className="text-xs">
                <span className="text-gray-500 dark:text-gray-400">Lifetime:</span>
                <span className="ml-1 font-medium text-blue-600 dark:text-blue-400">
                  {totalLifetimeExecutions} total
                </span>
              </div>
              <div className="text-xs">
                <span className="text-gray-500 dark:text-gray-400">Session:</span>
                <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                  {sessionExecutions} executed
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={onClearHistory}
            variant="danger"
            size="xs"
            title="Clear all command history"
          >
            Clear History
          </Button>
        </div>

        {/* Tab navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("frequent")}
            className={clsx(
              "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
              {
                "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm":
                  activeTab === "frequent",
                "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white":
                  activeTab !== "frequent",
              }
            )}
          >
            Most Used ({frequentCommands.length})
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={clsx(
              "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
              {
                "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm":
                  activeTab === "recent",
                "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white":
                  activeTab !== "recent",
              }
            )}
          >
            Recent ({recentCommands.length})
          </button>
        </div>
      </div>

      <div className="p-4">
        {currentCommands.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {activeTab === "frequent"
              ? "No frequently used commands yet. Rerunnable actions from OBS events and manual commands will appear here!"
              : "No recent commands yet. All rerunnable actions (from events and manual execution) will appear here!"}
          </div>
        ) : (
          <div className="space-y-2">
            {currentCommands.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.description}
                    </span>
                    
                    {/* Enhanced usage statistics */}
                    <div className="flex items-center space-x-1">
                      {activeTab === "frequent" && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
                          {item.useCount} lifetime
                        </span>
                      )}
                      {item.sessionCount > 0 && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
                          {item.sessionCount} session
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {item.command?.type}
                    </span>
                    <span>•</span>
                    <span>{formatLastUsed(item.lastUsed)}</span>
                  </div>
                </div>

                <RerunButton
                  onClick={() => onRunCommand(item.command)}
                  disabled={!isConnected}
                  title={
                    !isConnected
                      ? "Not connected to OBS"
                      : `Run: ${item.description}`
                  }
                  className="ml-3"
                  size="md"
                >
                  🔄 Run
                </RerunButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
