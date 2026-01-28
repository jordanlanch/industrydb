export function LeadCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 animate-pulse bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title and badges */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-48 shimmer"></div>
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 shimmer"></div>
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 shimmer"></div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-32 shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-36 shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-40 shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-28 shimmer"></div>
          </div>

          {/* Progress bars */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex-1 max-w-xs space-y-1">
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-24 shimmer"></div>
              <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-full shimmer"></div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 w-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded shimmer"></div>
              ))}
            </div>
          </div>

          {/* Completeness */}
          <div className="mt-2 space-y-1">
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-40 shimmer"></div>
            <div className="h-1.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-full max-w-xs shimmer"></div>
          </div>
        </div>

        {/* Quality score */}
        <div className="text-right ml-4">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 mb-2 shimmer"></div>
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-12 shimmer"></div>
        </div>
      </div>
    </div>
  )
}

export function LeadCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <LeadCardSkeleton key={i} />
      ))}
    </div>
  )
}
