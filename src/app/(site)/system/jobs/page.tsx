"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";

type JobStatus = "running" | "completed" | "failed" | "pending";
type JobType = "find-products" | "discover" | "fix-products";
type DisplayMode = "single" | "small" | "compact";

interface AgentJob {
  id: string;
  type: JobType;
  name: string;
  description: string;
  status: JobStatus;
  progress: number;
  startedAt: Date | null;
  completedAt: Date | null;
  itemsProcessed: number;
  totalItems: number;
  error?: string;
}

const mockJobs: AgentJob[] = [
  {
    id: "job-001",
    type: "find-products",
    name: "Find Products for Ingredients",
    description: "Searching and creating products for unmatched ingredients",
    status: "running",
    progress: 67,
    startedAt: new Date(Date.now() - 1000 * 60 * 15),
    completedAt: null,
    itemsProcessed: 134,
    totalItems: 200,
  },
  {
    id: "job-002",
    type: "discover",
    name: "YouTube Video Discovery",
    description: "Discovering new recipe videos from YouTube channels",
    status: "running",
    progress: 23,
    startedAt: new Date(Date.now() - 1000 * 60 * 5),
    completedAt: null,
    itemsProcessed: 23,
    totalItems: 100,
  },
  {
    id: "job-003",
    type: "fix-products",
    name: "Fix Missing Product Data",
    description: "Repairing products with missing images or descriptions",
    status: "completed",
    progress: 100,
    startedAt: new Date(Date.now() - 1000 * 60 * 60),
    completedAt: new Date(Date.now() - 1000 * 60 * 30),
    itemsProcessed: 45,
    totalItems: 45,
  },
  {
    id: "job-004",
    type: "find-products",
    name: "Bulk Product Creation",
    description: "Creating new products from ingredient list batch",
    status: "failed",
    progress: 45,
    startedAt: new Date(Date.now() - 1000 * 60 * 120),
    completedAt: new Date(Date.now() - 1000 * 60 * 90),
    itemsProcessed: 45,
    totalItems: 100,
    error: "API rate limit exceeded while fetching product data",
  },
  {
    id: "job-005",
    type: "discover",
    name: "Recipe Website Scrape",
    description: "Discovering new recipes from partner websites",
    status: "pending",
    progress: 0,
    startedAt: null,
    completedAt: null,
    itemsProcessed: 0,
    totalItems: 50,
  },
  {
    id: "job-006",
    type: "fix-products",
    name: "Fix Broken Product Links",
    description: "Updating products with broken or expired URLs",
    status: "completed",
    progress: 100,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    completedAt: new Date(Date.now() - 1000 * 60 * 60),
    itemsProcessed: 78,
    totalItems: 78,
  },
  {
    id: "job-007",
    type: "discover",
    name: "New Channel Discovery",
    description: "Finding new recipe channels to add to discovery queue",
    status: "pending",
    progress: 0,
    startedAt: null,
    completedAt: null,
    itemsProcessed: 0,
    totalItems: 25,
  },
  {
    id: "job-008",
    type: "fix-products",
    name: "Fix Invalid Prices",
    description: "Correcting products with outdated or invalid pricing",
    status: "running",
    progress: 52,
    startedAt: new Date(Date.now() - 1000 * 60 * 8),
    completedAt: null,
    itemsProcessed: 26,
    totalItems: 50,
  },
];

function getStatusColor(status: JobStatus): string {
  switch (status) {
    case "running":
      return "bg-blue-500";
    case "completed":
      return "bg-green-500";
    case "failed":
      return "bg-red-500";
    case "pending":
      return "bg-yellow-500";
  }
}

function getStatusBgColor(status: JobStatus): string {
  switch (status) {
    case "running":
      return "bg-blue-500/10 text-blue-500";
    case "completed":
      return "bg-green-500/10 text-green-500";
    case "failed":
      return "bg-red-500/10 text-red-500";
    case "pending":
      return "bg-yellow-500/10 text-yellow-500";
  }
}

function getTypeColor(type: JobType): string {
  switch (type) {
    case "find-products":
      return "bg-purple-500/10 text-purple-500";
    case "discover":
      return "bg-orange-500/10 text-orange-500";
    case "fix-products":
      return "bg-teal-500/10 text-teal-500";
  }
}

function getTypeLabel(type: JobType): string {
  switch (type) {
    case "find-products":
      return "Find Products";
    case "discover":
      return "Discover";
    case "fix-products":
      return "Fix Products";
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDuration(start: Date, end: Date): string {
  const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default function JobsPage() {
  const [filter, setFilter] = useState<JobType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("single");

  const filteredJobs = mockJobs.filter((job) => {
    if (filter !== "all" && job.type !== filter) return false;
    if (statusFilter !== "all" && job.status !== statusFilter) return false;
    return true;
  });

  const runningCount = mockJobs.filter((j) => j.status === "running").length;
  const pendingCount = mockJobs.filter((j) => j.status === "pending").length;
  const failedCount = mockJobs.filter((j) => j.status === "failed").length;

  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agent Background Jobs</h1>
        <p className="text-muted-foreground">
          Monitor and manage background processing tasks
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Running</div>
          <div className="text-2xl font-bold text-blue-500">{runningCount}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Failed</div>
          <div className="text-2xl font-bold text-red-500">{failedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground self-center">Type:</span>
          {(["all", "find-products", "discover", "fix-products"] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(type)}
            >
              {type === "all" ? "All" : getTypeLabel(type)}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground self-center">Status:</span>
          {(["all", "running", "pending", "completed", "failed"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          <Button
            variant={displayMode === "single" ? "default" : "outline"}
            size="sm"
            className="px-2"
            onClick={() => setDisplayMode("single")}
            title="Single column"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="6" rx="1" />
              <rect x="3" y="12" width="18" height="6" rx="1" />
            </svg>
          </Button>
          <Button
            variant={displayMode === "small" ? "default" : "outline"}
            size="sm"
            className="px-2"
            onClick={() => setDisplayMode("small")}
            title="Two columns"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
            </svg>
          </Button>
          <Button
            variant={displayMode === "compact" ? "default" : "outline"}
            size="sm"
            className="px-2"
            onClick={() => setDisplayMode("compact")}
            title="Three columns"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="5" height="5" rx="1" />
              <rect x="10" y="3" width="5" height="5" rx="1" />
              <rect x="17" y="3" width="5" height="5" rx="1" />
              <rect x="3" y="10" width="5" height="5" rx="1" />
              <rect x="10" y="10" width="5" height="5" rx="1" />
              <rect x="17" y="10" width="5" height="5" rx="1" />
              <rect x="3" y="17" width="5" height="5" rx="1" />
              <rect x="10" y="17" width="5" height="5" rx="1" />
              <rect x="17" y="17" width="5" height="5" rx="1" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      <div
        className={
          displayMode === "single"
            ? "space-y-4"
            : displayMode === "small"
            ? "grid grid-cols-2 gap-4"
            : "grid grid-cols-3 gap-3"
        }
      >
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className={`rounded-lg border hover:bg-muted/50 transition-colors ${
              displayMode === "compact" ? "p-3" : "p-4"
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-start justify-between ${
                displayMode === "compact" ? "mb-2" : "mb-3"
              }`}
            >
              <div
                className={`flex ${
                  displayMode === "compact"
                    ? "flex-col gap-1"
                    : "items-center gap-3"
                }`}
              >
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(job.type)}`}
                >
                  {getTypeLabel(job.type)}
                </span>
                <h3
                  className={
                    displayMode === "compact"
                      ? "text-sm font-semibold line-clamp-1"
                      : "font-semibold"
                  }
                >
                  {job.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBgColor(job.status)}`}
                >
                  {job.status}
                </span>
                {job.status === "running" && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>
            </div>

            {/* Description - hidden in compact mode */}
            {displayMode !== "compact" && (
              <p
                className={`text-sm text-muted-foreground mb-3 ${
                  displayMode === "small" ? "line-clamp-2" : ""
                }`}
              >
                {job.description}
              </p>
            )}

            {/* Progress Bar */}
            {(job.status === "running" || job.status === "failed") && (
              <div className={displayMode === "compact" ? "mb-2" : "mb-3"}>
                {displayMode !== "compact" && (
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>
                      {job.itemsProcessed} / {job.totalItems} items
                    </span>
                    <span>{job.progress}%</span>
                  </div>
                )}
                <div
                  className={`w-full bg-muted rounded-full ${
                    displayMode === "compact" ? "h-1.5" : "h-2"
                  }`}
                >
                  <div
                    className={`rounded-full transition-all ${getStatusColor(job.status)} ${
                      displayMode === "compact" ? "h-1.5" : "h-2"
                    }`}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                {displayMode === "compact" && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {job.progress}%
                  </div>
                )}
              </div>
            )}

            {/* Error Message - truncated in small/compact modes */}
            {job.error && (
              <div
                className={`p-2 rounded bg-red-500/10 border border-red-500/20 ${
                  displayMode === "compact" ? "mb-2" : "mb-3"
                }`}
              >
                <p
                  className={`text-sm text-red-500 ${
                    displayMode !== "single" ? "line-clamp-1" : ""
                  }`}
                >
                  {job.error}
                </p>
              </div>
            )}

            {/* Timestamps - simplified in compact mode */}
            <div
              className={`flex gap-4 text-xs text-muted-foreground ${
                displayMode === "compact" ? "flex-col gap-1" : ""
              }`}
            >
              {job.startedAt && (
                <span>
                  {displayMode === "compact" ? "" : "Started: "}
                  {formatTimeAgo(job.startedAt)}
                </span>
              )}
              {displayMode !== "compact" && job.completedAt && job.startedAt && (
                <span>
                  Duration: {formatDuration(job.startedAt, job.completedAt)}
                </span>
              )}
              {displayMode !== "compact" && job.status === "completed" && (
                <span className="text-green-500">
                  Processed {job.itemsProcessed} items
                </span>
              )}
            </div>

            {/* Actions - hidden in compact mode */}
            {displayMode !== "compact" && (
              <div className="flex gap-2 mt-3">
                {job.status === "running" && (
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                )}
                {job.status === "failed" && (
                  <Button variant="outline" size="sm">
                    Retry
                  </Button>
                )}
                {job.status === "pending" && (
                  <Button variant="outline" size="sm">
                    Start Now
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  View Logs
                </Button>
              </div>
            )}
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div
            className={`text-center py-12 text-muted-foreground ${
              displayMode !== "single" ? "col-span-full" : ""
            }`}
          >
            No jobs match the current filters
          </div>
        )}
      </div>
    </div>
  );
}
