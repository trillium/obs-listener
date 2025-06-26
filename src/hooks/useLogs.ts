import { useState, useCallback } from "react";
import type { LogType } from "@/types/obs";

export interface LogEntry {
    id: string;
    timestamp: Date;
    type: LogType;
    message: string;
    data?: Record<string, unknown>;
    command?: {
        type: string;
        params?: Record<string, unknown>;
        description: string;
    };
}

export function useLogs() {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const addLog = useCallback(
        (type: LogEntry["type"], message: string, data?: unknown, command?: LogEntry["command"]) => {
            let processedData: Record<string, unknown> | undefined;

            if (data !== null && data !== undefined) {
                if (typeof data === "object") {
                    try {
                        processedData = JSON.parse(JSON.stringify(data));
                    } catch {
                        processedData = { error: "Failed to serialize data" };
                    }
                } else {
                    processedData = { value: String(data) };
                }
            }

            const logEntry: LogEntry = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                timestamp: new Date(),
                type,
                message,
                data: processedData,
                command,
            };

            setLogs((prev) => [...prev, logEntry]);
        },
        []
    );

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    const exportLogs = useCallback(() => {
        const dataStr = JSON.stringify(logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `obs-logs-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }, [logs]);

    const filterLogs = useCallback((logs: LogEntry[], filter: string, searchTerm: string) => {
        return logs.filter((log) => {
            // Filter by type
            if (filter !== "all" && log.type !== filter) return false;

            // Filter by search term
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchesMessage = log.message.toLowerCase().includes(searchLower);
                const matchesData = log.data
                    ? JSON.stringify(log.data).toLowerCase().includes(searchLower)
                    : false;
                if (!matchesMessage && !matchesData) return false;
            }

            return true;
        });
    }, []);

    return {
        logs,
        addLog,
        clearLogs,
        exportLogs,
        filterLogs,
    };
}
