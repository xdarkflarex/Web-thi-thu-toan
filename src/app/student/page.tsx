import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function StudentPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 gap-6">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Coming Soon
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          This page is under construction
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          We're working on something amazing. Please check back later!
        </p>
        <div className="pt-4">
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}


