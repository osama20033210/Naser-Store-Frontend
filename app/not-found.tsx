import Link from "next/link";
export default function NotFound(){return <main className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-3xl font-black">Page not found</h1><Link className="mt-5 inline-block font-semibold text-indigo-600" href="/dashboard">Return to workspace</Link></div></main>}
