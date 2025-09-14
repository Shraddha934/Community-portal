export default function AdminDashboard() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-md w-full">
        <h1 className="text-3xl font-extrabold text-blue-600">
          Welcome Admin!
        </h1>
        <p className="mt-4 text-gray-600 text-lg">
          This is your admin dashboard.
        </p>
      </div>
    </div>
  );
}
