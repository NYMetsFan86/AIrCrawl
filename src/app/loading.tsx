export default function Loading() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#860808] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AIrCrawl...</p>
        </div>
      </div>
    );
  }