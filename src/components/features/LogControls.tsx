import Button from "../ui/Button";

interface LogControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  isAutoScroll: boolean;
  setIsAutoScroll: (autoScroll: boolean) => void;
  onExportLogs: () => void;
  onClearLogs: () => void;
  totalLogs: number;
  filteredLogsCount: number;
}

export default function LogControls({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  isAutoScroll,
  setIsAutoScroll,
  onExportLogs,
  onClearLogs,
  totalLogs,
  filteredLogsCount,
}: LogControlsProps) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          WebSocket Traffic
        </h2>

        <div className="flex items-center space-x-2 flex-wrap">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700 w-40"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700 cursor-pointer"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="event">Events</option>
          </select>

          <label className="flex items-center text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isAutoScroll}
              onChange={(e) => setIsAutoScroll(e.target.checked)}
              className="mr-2 cursor-pointer"
            />
            Auto-scroll
          </label>

          <Button
            onClick={onExportLogs}
            disabled={totalLogs === 0}
            variant="secondary"
            size="sm"
          >
            Export
          </Button>

          <Button onClick={onClearLogs} variant="danger" size="sm">
            Clear
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Total logs: {totalLogs}
        {(searchTerm || filter !== "all") && (
          <span> | Filtered: {filteredLogsCount}</span>
        )}
        {searchTerm && (
          <span className="ml-2 text-blue-600 dark:text-blue-400">
            (searching: &ldquo;{searchTerm}&rdquo;)
          </span>
        )}
      </div>
    </div>
  );
}
