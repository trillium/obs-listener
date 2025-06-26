import { useState, useEffect, useCallback } from "react";
import type { LogEntry } from "./useLogs";

export interface CommandHistoryItem {
    id: string;
    command: LogEntry["command"];
    lastUsed: Date;
    useCount: number; // Lifetime total count
    sessionCount: number; // Count for current session
    description: string;
    firstUsed: Date; // When command was first tracked
}

interface UseCommandHistoryReturn {
    commandHistory: CommandHistoryItem[];
    addCommandToHistory: (command: LogEntry["command"]) => void;
    clearHistory: () => void;
    clearSessionCounts: () => void; // New function to reset session counts
    getFrequentCommands: (limit?: number) => CommandHistoryItem[];
    getRecentCommands: (limit?: number) => CommandHistoryItem[];
    getTotalLifetimeExecutions: () => number; // Total across all commands
    getSessionExecutions: () => number; // Total for current session
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
                    sessionCount?: number;
                    description: string;
                    firstUsed?: string;
                }>;
                // Convert date strings back to Date objects and handle legacy data
                const historyWithDates = parsed.map((item) => ({
                    ...item,
                    lastUsed: new Date(item.lastUsed),
                    sessionCount: 0, // Reset session count on load
                    firstUsed: item.firstUsed ? new Date(item.firstUsed) : new Date(item.lastUsed), // Use lastUsed as fallback for legacy data
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
                    useCount: updated[existingIndex].useCount + 1, // Lifetime count
                    sessionCount: updated[existingIndex].sessionCount + 1, // Session count
                };
                return updated;
            } else {
                // Add new command to history
                const now = new Date();
                const newItem: CommandHistoryItem = {
                    id: commandId,
                    command,
                    lastUsed: now,
                    useCount: 1, // Lifetime count starts at 1
                    sessionCount: 1, // Session count starts at 1
                    description: command.description,
                    firstUsed: now, // Track when first used
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

    const clearSessionCounts = useCallback(() => {
        setCommandHistory((prev) => 
            prev.map((item) => ({ ...item, sessionCount: 0 }))
        );
    }, []);

    const getTotalLifetimeExecutions = useCallback(() => {
        return commandHistory.reduce((total, item) => total + item.useCount, 0);
    }, [commandHistory]);

    const getSessionExecutions = useCallback(() => {
        return commandHistory.reduce((total, item) => total + item.sessionCount, 0);
    }, [commandHistory]);

    return {
        commandHistory,
        addCommandToHistory,
        clearHistory,
        clearSessionCounts,
        getFrequentCommands,
        getRecentCommands,
        getTotalLifetimeExecutions,
        getSessionExecutions,
    };
}
