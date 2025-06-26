import { useState, useEffect, useCallback } from "react";
import type { LogEntry } from "./useLogs";

export interface CommandHistoryItem {
    id: string;
    command: LogEntry["command"];
    lastUsed: Date;
    useCount: number;
    description: string;
}

interface UseCommandHistoryReturn {
    commandHistory: CommandHistoryItem[];
    addCommandToHistory: (command: LogEntry["command"]) => void;
    clearHistory: () => void;
    getFrequentCommands: (limit?: number) => CommandHistoryItem[];
    getRecentCommands: (limit?: number) => CommandHistoryItem[];
}

const STORAGE_KEY = "obs-listener-command-history";

export function useCommandHistory(): UseCommandHistoryReturn {
    const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);

    // Load command history from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Array<{
                    id: string;
                    command: LogEntry["command"];
                    lastUsed: string;
                    useCount: number;
                    description: string;
                }>;
                // Convert date strings back to Date objects
                const historyWithDates = parsed.map((item) => ({
                    ...item,
                    lastUsed: new Date(item.lastUsed),
                }));
                setCommandHistory(historyWithDates);
            }
        } catch (error) {
            console.warn("Failed to load command history from localStorage:", error);
        }
    }, []);

    // Save command history to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(commandHistory));
        } catch (error) {
            console.warn("Failed to save command history to localStorage:", error);
        }
    }, [commandHistory]);

    const addCommandToHistory = useCallback((command: LogEntry["command"]) => {
        if (!command) return;

        setCommandHistory((prev) => {
            // Create a unique ID for this command based on its properties
            const commandId = `${command.type}-${JSON.stringify(command.params || {})}`;

            // Find existing command in history
            const existingIndex = prev.findIndex((item) => item.id === commandId);

            if (existingIndex >= 0) {
                // Update existing command
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    lastUsed: new Date(),
                    useCount: updated[existingIndex].useCount + 1,
                };
                return updated;
            } else {
                // Add new command to history
                const newItem: CommandHistoryItem = {
                    id: commandId,
                    command,
                    lastUsed: new Date(),
                    useCount: 1,
                    description: command.description,
                };
                return [...prev, newItem];
            }
        });
    }, []);

    const clearHistory = useCallback(() => {
        setCommandHistory([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn("Failed to clear command history from localStorage:", error);
        }
    }, []);

    const getFrequentCommands = useCallback((limit = 10) => {
        return [...commandHistory]
            .sort((a, b) => b.useCount - a.useCount)
            .slice(0, limit);
    }, [commandHistory]);

    const getRecentCommands = useCallback((limit = 10) => {
        return [...commandHistory]
            .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
            .slice(0, limit);
    }, [commandHistory]);

    return {
        commandHistory,
        addCommandToHistory,
        clearHistory,
        getFrequentCommands,
        getRecentCommands,
    };
}
