import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-lg text-muted">Page not found.</p>
      <Link
        href="/"
        className="text-sm font-medium text-primary hover:underline"
      >
        Go home
      </Link>
    </div>
  );
}
