import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSessionUserAndRole } from '@/lib/auth'

export default async function Home() {
  const { user } = await getSessionUserAndRole()
  
  // Redirect to login if not authenticated
  if (!user) {
    redirect('/auth/sign-in')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 gap-6">
      <h1 className="text-2xl font-semibold">THPT Question Bank Demo</h1>
      <div className="flex gap-4">
        <Link className="rounded bg-blue-600 text-white px-4 py-2" href="/student">Vào thi (không cần đăng nhập)</Link>
        <Link className="rounded bg-green-600 text-white px-4 py-2" href="/teacher">Giáo viên (soạn câu hỏi)</Link>
        <a className="rounded bg-gray-700 text-white px-4 py-2" href="/api/taxonomy" target="_blank" rel="noopener noreferrer">API: /api/taxonomy</a>
        <a className="rounded bg-gray-700 text-white px-4 py-2" href="/api/questions" target="_blank" rel="noopener noreferrer">API: /api/questions</a>
      </div>
    </main>
  );
}
