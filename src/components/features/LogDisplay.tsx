import { forwardRef } from "react";
import type { LogEntry } from "@/hooks/useLogs";
import LogEntryItem from "./LogEntryItem";

interface LogDisplayProps {
  logs: LogEntry[];
  totalLogs: number;
  onRerunCommand?: (command: LogEntry["command"]) => void;
  isConnected?: boolean;
}

const LogDisplay = forwardRef<HTMLDivElement, LogDisplayProps>(
  ({ logs, totalLogs, onRerunCommand, isConnected }, ref) => {
    return (
      <div className="h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {totalLogs === 0
              ? "No logs yet. Connect to OBS to start monitoring."
              : "No logs match the current filter."}
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <LogEntryItem
                key={log.id}
                log={log}
                onRerunCommand={onRerunCommand}
                isConnected={isConnected}
              />
            ))}
            <div ref={ref} />
          </div>
        )}
      </div>
    );
  }
);

LogDisplay.displayName = "LogDisplay";

export default LogDisplay;
