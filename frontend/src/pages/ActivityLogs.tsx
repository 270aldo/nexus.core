import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Header } from "../components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "../components/Pagination";
import { DateRangePicker } from "../components/DateRangePicker";
import * as ds from "utils/design-system";

import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Filter, Search, X, FileText, Info, List, RefreshCw, ArrowDown, ArrowUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import html2pdf from "html2pdf.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  timestamp: string;
  created_at: string;
}

interface FilterState {
  entity_type: string | null;
  entity_id: string | null;
  user_id: string | null;
  action: string | null;
  from_date: Date | null;
  to_date: Date | null;
}

interface SortState {
  field: string;
  direction: "asc" | "desc";
}

const activityColors: Record<string, string> = {
  create: "bg-green-500/10 text-green-500 border-green-500/20",
  update: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  delete: "bg-red-500/10 text-red-500 border-red-500/20",
  view: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  assign: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  login: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  logout: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  default: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const entityColors: Record<string, string> = {
  client: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  program: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  nutrition: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  progress: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  user: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  system: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  default: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [exportData, setExportData] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState("logs");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sort, setSort] = useState<SortState>({ field: "timestamp", direction: "desc" });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    entity_type: null,
    entity_id: null,
    user_id: null,
    action: null,
    from_date: null,
    to_date: null,
  });

  // Entity types and actions for select options
  const entityTypes = [
    "client",
    "program",
    "nutrition",
    "progress",
    "user",
    "system",
  ];
  
  const actions = [
    "create",
    "update",
    "delete",
    "view",
    "assign",
    "login",
    "logout",
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      
      const requestBody = {
        limit,
        offset,
        entity_type: filters.entity_type || undefined,
        entity_id: filters.entity_id || undefined,
        user_id: filters.user_id || undefined,
        action: filters.action || undefined,
        from_date: filters.from_date ? filters.from_date : undefined,
        to_date: filters.to_date ? filters.to_date : undefined,
      };
      
      const response = await brain.get_activity_logs(requestBody);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data);
        setTotalCount(data.count || 0);
        setSelectedItems([]);
        
        // Prepare data for export
        const exportData = data.data.map((log: ActivityLog) => ({
          ID: log.id,
          Timestamp: formatTimestamp(log.timestamp),
          Action: log.action,
          EntityType: log.entity_type,
          EntityID: log.entity_id || "",
          UserID: log.user_id || "",
          Details: log.details ? JSON.stringify(log.details) : ""
        }));
        setExportData(exportData);
      } else {
        toast.error("Failed to load activity logs");
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error("Error loading activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, filters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset to first page on filter change
  };

  const resetFilters = () => {
    setFilters({
      entity_type: null,
      entity_id: null,
      user_id: null,
      action: null,
      from_date: null,
      to_date: null,
    });
    setPage(1);
  };

  const handleSort = (field: string) => {
    setSort(prev => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { field, direction: 'desc' };
    });
    
    // Local sorting only
    if (logs.length) {
      const sortedLogs = [...logs].sort((a: any, b: any) => {
        // Handle different field types appropriately
        if (field === 'timestamp') {
          const dateA = new Date(a[field]).getTime();
          const dateB = new Date(b[field]).getTime();
          return sort.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        // String comparison
        const valA = a[field] || '';
        const valB = b[field] || '';
        return sort.direction === 'asc' 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
      
      setLogs(sortedLogs);
    }
  };

  const getActivityBadgeClass = (action: string) => {
    return activityColors[action] || activityColors.default;
  };

  const getEntityBadgeClass = (entity: string) => {
    return entityColors[entity] || entityColors.default;
  };

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy h:mm a");
    } catch (e) {
      return timestamp;
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  const toggleAllSelection = () => {
    if (selectedItems.length === logs.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(logs.map(log => log.id));
    }
  };

  const exportToPdf = () => {
    try {
      const filename = `activity-logs-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      
      // Create a temporary div for the PDF content
      const element = document.createElement('div');
      element.className = 'p-4';
      
      // Add title
      const title = document.createElement('h2');
      title.textContent = 'System Activity Logs';
      title.className = 'text-xl font-bold mb-4';
      element.appendChild(title);
      
      // Add filter info if filters are active
      if (Object.values(filters).some(val => val !== null)) {
        const filterInfo = document.createElement('div');
        filterInfo.className = 'mb-4 text-sm';
        filterInfo.innerHTML = '<strong>Applied Filters:</strong><br>';
        
        if (filters.entity_type) filterInfo.innerHTML += `Entity Type: ${filters.entity_type}<br>`;
        if (filters.action) filterInfo.innerHTML += `Action: ${filters.action}<br>`;
        if (filters.entity_id) filterInfo.innerHTML += `Entity ID: ${filters.entity_id}<br>`;
        if (filters.user_id) filterInfo.innerHTML += `User ID: ${filters.user_id}<br>`;
        if (filters.from_date) filterInfo.innerHTML += `From: ${format(filters.from_date, "MMM d, yyyy")}<br>`;
        if (filters.to_date) filterInfo.innerHTML += `To: ${format(filters.to_date, "MMM d, yyyy")}<br>`;
        
        element.appendChild(filterInfo);
      }
      
      // Create table
      const table = document.createElement('table');
      table.className = 'w-full border-collapse';
      table.style.width = '100%';
      table.style.marginBottom = '20px';
      
      // Add header row
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User ID'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.className = 'border px-4 py-2 bg-gray-100 text-left';
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        th.style.borderBottom = '1px solid #ddd';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Add data rows
      const tbody = document.createElement('tbody');
      const dataToExport = selectedItems.length > 0 
        ? exportData.filter(item => selectedItems.includes(item.ID))
        : exportData;
        
      dataToExport.forEach((log, index) => {
        const row = document.createElement('tr');
        row.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
        
        [log.Timestamp, log.Action, log.EntityType, log.EntityID, log.UserID].forEach(cell => {
          const td = document.createElement('td');
          td.textContent = cell;
          td.className = 'border px-4 py-2';
          td.style.padding = '8px';
          td.style.borderBottom = '1px solid #ddd';
          row.appendChild(td);
        });
        
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      element.appendChild(table);
      
      // Add export meta info
      const exportInfo = document.createElement('div');
      exportInfo.className = 'text-sm text-gray-500 mt-4';
      exportInfo.innerHTML = `<p>Exported on: ${format(new Date(), "MMM d, yyyy h:mm a")}</p>`;
      exportInfo.innerHTML += `<p>Total Records: ${dataToExport.length} of ${totalCount}</p>`;
      element.appendChild(exportInfo);
      
      // Generate PDF
      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      
      html2pdf().set(opt).from(element).save();
      
      toast.success(selectedItems.length > 0 
        ? `Exporting ${selectedItems.length} selected logs to PDF`
        : 'Exporting all logs to PDF');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export logs');
    }
  };

  const exportToCSV = (data: any[]) => {
    try {
      // Create CSV content
      const headers = ['ID', 'Timestamp', 'Action', 'EntityType', 'EntityID', 'UserID', 'Details'];
      
      // Convert data to CSV string
      let csvContent = headers.join(',') + '\n';
      
      // Add data rows
      data.forEach(item => {
        const row = [
          item.ID,
          `"${item.Timestamp}"`,
          `"${item.Action}"`,
          `"${item.EntityType}"`,
          `"${item.EntityID}"`,
          `"${item.UserID}"`,
          `"${item.Details.replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + '\n';
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);
      
      // Trigger download and clean up
      link.click();
      document.body.removeChild(link);
      
      toast.success(data.length === exportData.length 
        ? 'Exporting all logs to CSV' 
        : `Exporting ${data.length} selected logs to CSV`);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export logs to CSV');
    }
  };


  return (
    <Layout>
      <Header
        title="System Activity Logs"
        description="Detailed audit trails of all activities in the system"
        accentColor="neutral"
        actions={
          <div className="flex gap-2">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "table" | "cards")}>
              <ToggleGroupItem value="table" aria-label="Toggle table view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="cards" aria-label="Toggle card view">
                <div className="flex flex-col h-4 w-4">
                  <div className="h-1.5 w-4 bg-current mb-0.5 rounded-sm"></div>
                  <div className="h-1.5 w-4 bg-current rounded-sm"></div>
                </div>
              </ToggleGroupItem>
            </ToggleGroup>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentTab("export")}
              className="inline-flex items-center justify-center h-9 px-4 py-2"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={fetchLogs}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Content Tabs */}
        <Tabs 
          defaultValue="logs" 
          value={currentTab} 
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="export">Export & Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logs" className="space-y-6 mt-4">
            {/* Filters Card */}
            <Card className={ds.borders.card}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Activity Log Filters</CardTitle>
                    <CardDescription>
                      Filter logs by type, action, date and more
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFiltering(!isFiltering)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {isFiltering ? "Hide Filters" : "Show Filters"}
                  </Button>
                </div>
              </CardHeader>

              {isFiltering && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Entity Type</label>
                      <Select
                        value={filters.entity_type || ""}
                        onValueChange={(value) =>
                          handleFilterChange("entity_type", value || null)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All entity types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All entity types</SelectItem>
                          {entityTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Action</label>
                      <Select
                        value={filters.action || ""}
                        onValueChange={(value) =>
                          handleFilterChange("action", value || null)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All actions</SelectItem>
                          {actions.map((action) => (
                            <SelectItem key={action} value={action}>
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date Range</label>
                      <DateRangePicker
                        fromDate={filters.from_date}
                        toDate={filters.to_date}
                        onFromDateChange={(date) =>
                          handleFilterChange("from_date", date)
                        }
                        onToDateChange={(date) => handleFilterChange("to_date", date)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Entity ID</label>
                      <Input
                        value={filters.entity_id || ""}
                        onChange={(e) =>
                          handleFilterChange("entity_id", e.target.value || null)
                        }
                        placeholder="Filter by entity ID"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">User ID</label>
                      <Input
                        value={filters.user_id || ""}
                        onChange={(e) =>
                          handleFilterChange("user_id", e.target.value || null)
                        }
                        placeholder="Filter by user ID"
                      />
                    </div>

                    <div className="flex items-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" /> Reset
                      </Button>
                      <Button
                        onClick={fetchLogs}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Search className="h-4 w-4 mr-2" /> Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Logs Table Card */}
            <Card className={ds.borders.card}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>System Activity History</CardTitle>
                    <CardDescription>
                      {selectedItems.length > 0 ? 
                        `${selectedItems.length} items selected` : 
                        "Detailed record of all actions in the system"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => setLimit(parseInt(value))}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="10 per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === "table" ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]">
                            <Checkbox 
                              checked={selectedItems.length === logs.length && logs.length > 0}
                              onCheckedChange={toggleAllSelection}
                              aria-label="Select all"
                            />
                          </TableHead>
                          <TableHead
                            className={`font-mono text-xs cursor-pointer ${sort.field === 'timestamp' ? 'bg-muted/50' : ''}`}
                            onClick={() => handleSort('timestamp')}
                          >
                            Timestamp
                            {sort.field === 'timestamp' && (
                              sort.direction === 'asc' ? 
                              <ArrowUp className="inline h-3 w-3 ml-1" /> : 
                              <ArrowDown className="inline h-3 w-3 ml-1" />
                            )}
                          </TableHead>
                          <TableHead
                            className={`font-mono text-xs cursor-pointer ${sort.field === 'action' ? 'bg-muted/50' : ''}`}
                            onClick={() => handleSort('action')}
                          >
                            Action
                            {sort.field === 'action' && (
                              sort.direction === 'asc' ? 
                              <ArrowUp className="inline h-3 w-3 ml-1" /> : 
                              <ArrowDown className="inline h-3 w-3 ml-1" />
                            )}
                          </TableHead>
                          <TableHead
                            className={`font-mono text-xs cursor-pointer ${sort.field === 'entity_type' ? 'bg-muted/50' : ''}`}
                            onClick={() => handleSort('entity_type')}
                          >
                            Entity
                            {sort.field === 'entity_type' && (
                              sort.direction === 'asc' ? 
                              <ArrowUp className="inline h-3 w-3 ml-1" /> : 
                              <ArrowDown className="inline h-3 w-3 ml-1" />
                            )}
                          </TableHead>
                          <TableHead className="font-mono text-xs">Entity ID</TableHead>
                          <TableHead className="font-mono text-xs">User ID</TableHead>
                          <TableHead className="font-mono text-xs">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-10">
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Loading activity logs...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : logs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-10">
                              No activity logs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          logs.map((log) => (
                            <TableRow
                              key={log.id}
                              className={`hover:bg-muted/50 ${selectedItems.includes(log.id) ? 'bg-muted/30' : ''}`}
                            >
                              <TableCell>
                                <Checkbox 
                                  checked={selectedItems.includes(log.id)}
                                  onCheckedChange={() => toggleItemSelection(log.id)}
                                  aria-label={`Select log ${log.id}`}
                                />
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {formatTimestamp(log.timestamp)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`${getActivityBadgeClass(
                                    log.action
                                  )} text-xs lowercase`}
                                >
                                  {log.action}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`${getEntityBadgeClass(
                                    log.entity_type
                                  )} text-xs lowercase`}
                                >
                                  {log.entity_type}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs truncate max-w-[100px]">
                                {log.entity_id || "--"}
                              </TableCell>
                              <TableCell className="font-mono text-xs truncate max-w-[100px]">
                                {log.user_id || "--"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(log)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                      <div className="col-span-full flex justify-center items-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading activity logs...</span>
                      </div>
                    ) : logs.length === 0 ? (
                      <div className="col-span-full text-center py-10">
                        No activity logs found
                      </div>
                    ) : (
                      logs.map((log) => (
                        <Card 
                          key={log.id} 
                          className={`cursor-pointer hover:shadow-md transition-all ${selectedItems.includes(log.id) ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => handleViewDetails(log)}
                        >
                          <CardHeader className="pb-2 flex flex-row items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  checked={selectedItems.includes(log.id)}
                                  onCheckedChange={(checked) => {
                                    toggleItemSelection(log.id);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label={`Select log ${log.id}`}
                                />
                                <Badge
                                  variant="outline"
                                  className={`${getActivityBadgeClass(log.action)} text-xs lowercase`}
                                >
                                  {log.action}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`${getEntityBadgeClass(log.entity_type)} text-xs lowercase`}
                                >
                                  {log.entity_type}
                                </Badge>
                              </div>
                              <div className="font-mono text-xs mt-2">
                                {formatTimestamp(log.timestamp)}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-1">
                              {log.entity_id && (
                                <div className="text-xs">
                                  <span className="text-muted-foreground">Entity ID:</span>{" "}
                                  <span className="font-mono">{log.entity_id}</span>
                                </div>
                              )}
                              {log.user_id && (
                                <div className="text-xs">
                                  <span className="text-muted-foreground">User ID:</span>{" "}
                                  <span className="font-mono">{log.user_id}</span>
                                </div>
                              )}
                              {log.details && Object.keys(log.details).length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(log);
                                  }}
                                >
                                  View Details
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {logs.length} of {totalCount} entries
                  </div>
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(totalCount / limit)}
                    onPageChange={setPage}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="export" className="space-y-6 mt-4">
            <Card className={ds.borders.card}>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>
                  Export activity logs for analysis and record keeping
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">PDF Export</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export logs as a formatted PDF document with table layout
                    </p>
                    <Button 
                      onClick={exportToPdf}
                      className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {selectedItems.length > 0 
                        ? `Export ${selectedItems.length} Selected Logs to PDF` 
                        : 'Export All Logs to PDF'}
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">CSV Export</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export logs as CSV for spreadsheet analysis
                    </p>
                    <Button 
                      onClick={() => exportToCSV(selectedItems.length > 0 
                        ? exportData.filter(item => selectedItems.includes(item.ID))
                        : exportData
                      )}
                      className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {selectedItems.length > 0 
                        ? `Export ${selectedItems.length} Selected Logs to CSV` 
                        : 'Export All Logs to CSV'}
                    </Button>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Data Selection</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedItems.length > 0 
                      ? `${selectedItems.length} items selected for export` 
                      : 'No items specifically selected - all current logs will be exported'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentTab("logs");
                    }}
                    className="mr-2">
                    Return to Logs to Select Items
                  </Button>
                  {selectedItems.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedItems([])}
                      className="text-destructive">
                      Clear Selection
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Activity Log Details</DialogTitle>
            <DialogDescription>Full details of the selected activity</DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Timestamp</h4>
                  <p className="text-sm font-mono">
                    {formatTimestamp(selectedLog.timestamp)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Action</h4>
                  <Badge
                    variant="outline"
                    className={`${getActivityBadgeClass(selectedLog.action)}`}
                  >
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Entity Type</h4>
                  <Badge
                    variant="outline"
                    className={`${getEntityBadgeClass(selectedLog.entity_type)}`}
                  >
                    {selectedLog.entity_type}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Entity ID</h4>
                  <p className="text-sm font-mono break-all">
                    {selectedLog.entity_id || "--"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">User ID</h4>
                  <p className="text-sm font-mono break-all">
                    {selectedLog.user_id || "--"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Log ID</h4>
                  <p className="text-sm font-mono break-all">{selectedLog.id}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Details</h4>
                <Textarea
                  readOnly
                  value={
                    selectedLog.details
                      ? JSON.stringify(selectedLog.details, null, 2)
                      : "No additional details"
                  }
                  className="font-mono text-xs bg-muted/50 min-h-[200px]"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLog(null)}
                >
                  Close
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                      toast.success("Log details copied to clipboard");
                    } catch (error) {
                      console.error("Failed to copy to clipboard:", error);
                      toast.error("Failed to copy to clipboard");
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 ml-2"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Copy Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
