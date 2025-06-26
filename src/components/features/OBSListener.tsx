"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import OBSWebSocket from "obs-websocket-js";
import type { ConnectionStatus } from "@/types/obs";
import { getDefaultOBSConfig, validateOBSConfig } from "@/lib/config";
import { useOBSEventHandlers } from "@/hooks/useOBSEventHandlers";
import { useLogs } from "@/hooks/useLogs";
import { useOBSCommands } from "@/hooks/useOBSCommands";
import { useToast } from "@/hooks/useToast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import AppHeader from "./AppHeader";
import LogControls from "./LogControls";
import LogDisplay from "./LogDisplay";
import CommandHistoryPanel from "./CommandHistoryPanel";
import ToastContainer from "../ui/ToastContainer";

interface ConnectionConfig {
  address: string;
  port: string;
  password: string;
}

export default function OBSListener() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [config, setConfig] = useState<ConnectionConfig>(() =>
    getDefaultOBSConfig()
  );
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const obsRef = useRef<OBSWebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const {
    logs,
    addLog: originalAddLog,
    clearLogs,
    exportLogs,
    filterLogs,
  } = useLogs();
  const { toasts, addToast, removeToast } = useToast();
  const {
    addCommandToHistory,
    clearHistory,
    getFrequentCommands,
    getRecentCommands,
  } = useCommandHistory();

  // Enhanced addLog that automatically tracks commands
  const addLog = useCallback(
    (
      type: Parameters<typeof originalAddLog>[0],
      message: string,
      data?: unknown,
      command?: Parameters<typeof originalAddLog>[3]
    ) => {
      // Add the log entry
      originalAddLog(type, message, data, command);

      // If this log entry has a rerunnable command, add it to history
      if (command) {
        addCommandToHistory(command);
      }
    },
    [originalAddLog, addCommandToHistory]
  );

  const { executeCommand, createCommandFromEvent } = useOBSCommands({
    obsRef,
    addLog,
    isConnected,
  });
  const { setupEventHandlers } = useOBSEventHandlers({
    addLog,
    setIsConnected,
    setConnectionStatus,
    createCommandFromEvent,
  });

  const filteredLogs = filterLogs(logs, filter, searchTerm);

  // Since addLog now automatically tracks commands, we can use executeCommand directly
  // But we'll keep this wrapper for potential future enhancements
  const executeCommandWithHistory = useCallback(
    (command: Parameters<typeof executeCommand>[0]) => {
      return executeCommand(command);
    },
    [executeCommand]
  );

  const handleShowEnvironmentToast = useCallback(() => {
    const autoConnectText =
      process.env.NEXT_PUBLIC_OBS_AUTO_CONNECT === "true"
        ? " Auto-connect enabled."
        : "";
    addToast(
      `Environment defaults loaded from .env.local file.${autoConnectText}`,
      "info",
      4000
    );
  }, [addToast]);

  useEffect(() => {
    if (isAutoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isAutoScroll]);

  const connect = useCallback(async () => {
    // Validate configuration before connecting
    const errors = validateOBSConfig(config);
    if (errors.length > 0) {
      setValidationErrors(errors);
      addLog("error", `Configuration validation failed: ${errors.join(", ")}`);
      return;
    }

    setValidationErrors([]);

    if (obsRef.current) {
      // Handle disconnect inline to avoid circular dependency
      try {
        await obsRef.current.disconnect();
        addLog("info", "Disconnecting existing connection...");
      } catch (error) {
        addLog("warning", "Error disconnecting existing connection", error);
      }
      obsRef.current = null;
      setIsConnected(false);
      setConnectionStatus("disconnected");
    }

    const obs = new OBSWebSocket();
    obsRef.current = obs;

    setConnectionStatus("connecting");
    addLog(
      "info",
      `Attempting to connect to ws://${config.address}:${config.port}`
    );

    try {
      // Set up event listeners before connecting
      setupEventHandlers(obs);

      // Connect to OBS
      await obs.connect(
        `ws://${config.address}:${config.port}`,
        config.password
      );
    } catch (error) {
      addLog("error", "Failed to connect to OBS", error);
      setConnectionStatus("error");
    }
  }, [config, addLog, setupEventHandlers]);

  const disconnect = useCallback(async () => {
    if (obsRef.current) {
      try {
        await obsRef.current.disconnect();
        addLog("info", "Disconnected from OBS");
      } catch (error) {
        addLog("error", "Error during disconnect", error);
      }
      obsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("disconnected");
  }, [addLog]);

  // Attempt to connect automatically on component mount
  useEffect(() => {
    const attemptAutoConnection = async () => {
      // Check if auto-connect is enabled
      const autoConnect = process.env.NEXT_PUBLIC_OBS_AUTO_CONNECT !== "false";

      // Only auto-connect if enabled and we have a valid configuration and aren't already connected
      if (autoConnect && connectionStatus === "disconnected") {
        const errors = validateOBSConfig(config);
        if (errors.length === 0) {
          addLog("info", "Attempting automatic connection...");
          await connect();
        } else {
          addLog(
            "warning",
            "Automatic connection skipped due to configuration issues"
          );
          setValidationErrors(errors);
        }
      } else if (!autoConnect) {
        addLog(
          "info",
          "Automatic connection disabled via environment variable"
        );
      }
    };

    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(attemptAutoConnection, 1000);

    return () => clearTimeout(timer);
  }, [config, connect, connectionStatus, addLog]);

  return (
    <>
      <div className="space-y-6">
        <AppHeader
          config={config}
          setConfig={setConfig}
          connectionStatus={connectionStatus}
          isConnected={isConnected}
          validationErrors={validationErrors}
          onConnect={connect}
          onDisconnect={disconnect}
          onShowEnvironmentToast={handleShowEnvironmentToast}
        />

        {/* Command History Panel */}
        <CommandHistoryPanel
          frequentCommands={getFrequentCommands(8)}
          recentCommands={getRecentCommands(8)}
          onRunCommand={executeCommandWithHistory}
          onClearHistory={clearHistory}
          isConnected={isConnected}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <LogControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filter={filter}
            setFilter={setFilter}
            isAutoScroll={isAutoScroll}
            setIsAutoScroll={setIsAutoScroll}
            onExportLogs={exportLogs}
            onClearLogs={clearLogs}
            totalLogs={logs.length}
            filteredLogsCount={filteredLogs.length}
          />

          <LogDisplay
            ref={logsEndRef}
            logs={filteredLogs}
            totalLogs={logs.length}
            onRerunCommand={executeCommandWithHistory}
            isConnected={isConnected}
          />
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
