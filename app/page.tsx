export default function Home() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
				{/* Add route to dashboard */}
				<h1 className="text-5xl font-bold text-gray-900 dark:text-white">
					Welcome to the Alumni Event Attendance App
				</h1>
				<p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
					Please log in to access the dashboard and manage your events.
				</p>
				{/* Route to alumni page http://localhost:3000/alumni/login */}
				<a
					href="/alumni/login"
					className="mt-8 inline-block rounded-lg bg-blue-500 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-600"
				>
					Go to Alumni Login
				</a>
				{/* Route to admin page http://localhost:3000/admin/login */}
				<a
					href="/admin/login"
					className="mt-4 inline-block rounded-lg bg-green-500 px-6 py-3 text-lg font-semibold text-white hover:bg-green-600"
				>
					Go to Admin Login
				</a>
			</main>
		</div>
	);
}
