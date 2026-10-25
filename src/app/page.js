import Navbar from "@/component/homepage/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col gap-5">
      <nav className="px-5 py-5">
        <Navbar />
      </nav>
      <div className="flex gap-3">
        <aside className="h-full flex-1/3 w-15 px-5 py-5">Sidebar</aside>
        <div className="px-5 py-5 flex-2/3 w-full">Content</div>
      </div>
    </div>
  );
}
