export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 gap-6">
      <h1 className="text-2xl font-semibold">THPT Question Bank Demo</h1>
      <div className="flex gap-4">
        <a className="rounded bg-blue-600 text-white px-4 py-2" href="/student">Vào thi (không cần đăng nhập)</a>
        <a className="rounded bg-green-600 text-white px-4 py-2" href="/teacher">Giáo viên (soạn câu hỏi)</a>
        <a className="rounded bg-gray-700 text-white px-4 py-2" href="/api/taxonomy">API: /api/taxonomy</a>
        <a className="rounded bg-gray-700 text-white px-4 py-2" href="/api/questions">API: /api/questions</a>
      </div>
    </main>
  );
}
