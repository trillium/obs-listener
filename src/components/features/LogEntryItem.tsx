import clsx from "clsx";
import RerunButton from "../ui/RerunButton";
import type { LogEntry } from "@/hooks/useLogs";

interface LogEntryItemProps {
  log: LogEntry;
  onRerunCommand?: (command: LogEntry["command"]) => void;
  isConnected?: boolean;
}

export default function LogEntryItem({
  log,
  onRerunCommand,
  isConnected,
}: LogEntryItemProps) {
  const getLogTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "info":
        return "text-blue-600 dark:text-blue-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      case "event":
        return "text-green-600 dark:text-green-400";
      case "request":
        return "text-purple-600 dark:text-purple-400";
      case "response":
        return "text-cyan-600 dark:text-cyan-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const handleCopyData = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (log.data) {
      navigator.clipboard.writeText(JSON.stringify(log.data, null, 2));
    }
  };

  const handleRerunCommand = () => {
    if (log.command && onRerunCommand) {
      onRerunCommand(log.command);
    }
  };

  return (
    <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-3 py-1">
      <div className="flex items-center space-x-2">
        <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
          {log.timestamp.toLocaleTimeString()}
        </span>
        <span
          className={clsx(
            "text-xs font-medium uppercase whitespace-nowrap",
            getLogTypeColor(log.type)
          )}
        >
          {log.type}
        </span>
        <span className="text-gray-900 dark:text-white flex-1 text-sm">
          {log.message}
        </span>

        {/* Inline actions */}
        <div className="flex items-center space-x-2">
          {/* View Data button */}
          {log.data && (
            <details className="group inline">
              <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 select-none flex items-center gap-1">
                📋 Data
              </summary>
              <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20 max-w-md max-h-60 overflow-auto">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      JSON Data
                    </span>
                    <button
                      onClick={handleCopyData}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors cursor-pointer"
                      title="Copy JSON data"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-xs overflow-x-auto text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              </div>
            </details>
          )}

          {/* Rerun command button */}
          {log.command && (
            <RerunButton
              onClick={handleRerunCommand}
              disabled={!isConnected}
              title={
                !isConnected
                  ? "Not connected to OBS"
                  : `Rerun: ${log.command.description}`
              }
              size="sm"
            >
              🔄 Rerun
            </RerunButton>
          )}
        </div>
      </div>
    </div>
  );
}
