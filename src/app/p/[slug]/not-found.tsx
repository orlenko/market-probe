import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-200">404</h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Project Not Found
        </h2>

        <p className="text-gray-600 mb-8">
          The project you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>

          <div className="text-sm text-gray-500">
            <p>Looking for a specific project?</p>
            <p>Check the URL or contact the project owner.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
