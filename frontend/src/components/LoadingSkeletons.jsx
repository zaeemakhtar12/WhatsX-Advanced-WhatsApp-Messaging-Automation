import React from 'react';

// Base Skeleton Component
export function Skeleton({ className = "", children, ...props }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Skeleton
export function CardSkeleton({ showActions = true }) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        )}
      </div>
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, index) => (
              <TableRowSkeleton key={index} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="stats-card">
      <div className="flex items-center">
        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
          <Skeleton className="w-6 h-6" />
        </div>
        <div className="ml-4 flex-1">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

// User Card Skeleton
export function UserCardSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <Skeleton className="h-4 w-12 mb-1" />
          <Skeleton className="h-5 w-48" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div>
            <Skeleton className="h-4 w-12 mb-1" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Form Skeleton
export function FormSkeleton({ fields = 3 }) {
  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="w-6 h-6" />
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
      
      <div className="flex gap-4">
        <Skeleton className="h-12 w-32 rounded-xl" />
        <Skeleton className="h-12 w-24 rounded-xl" />
      </div>
    </div>
  );
}

// Message Skeleton
export function MessageSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Grid Skeleton
export function GridSkeleton({ items = 6, CardComponent = CardSkeleton }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: items }).map((_, index) => (
        <CardComponent key={index} />
      ))}
    </div>
  );
}

// Page Skeleton
export function PageSkeleton({ 
  showStats = true, 
  showFilters = true, 
  showContent = true,
  contentType = "grid" // "grid" | "table" | "list"
}) {
  return (
    <div className="p-6 pl-12 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
        </div>
      )}

      {/* Content */}
      {showContent && (
        <>
          {contentType === "grid" && <GridSkeleton />}
          {contentType === "table" && <TableSkeleton />}
          {contentType === "list" && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <MessageSkeleton key={index} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Notification Skeleton
export function NotificationSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-lg rounded-2xl p-4 border border-gray-200 dark:border-dark-border shadow-elevated min-w-[300px]">
      <div className="flex items-start gap-3">
        <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
        </div>
        <Skeleton className="w-5 h-5 flex-shrink-0" />
      </div>
    </div>
  );
}

// Dashboard Overview Skeleton
export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="gradient-border rounded-2xl">
        <div className="gradient-border-inner p-8 text-center space-y-4">
          <Skeleton className="h-10 w-96 mx-auto" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="stats-card">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-8 h-8" />
              <Skeleton className="w-5 h-5" />
            </div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="floating-card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-surfaceHover">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="floating-card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-surfaceHover">
                <Skeleton className="w-2 h-2 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  StatsCardSkeleton,
  UserCardSkeleton,
  FormSkeleton,
  MessageSkeleton,
  GridSkeleton,
  PageSkeleton,
  NotificationSkeleton,
  DashboardOverviewSkeleton,
}; 