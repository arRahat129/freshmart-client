
export default function Home() {
  return (
    <div className="flex gap-5">
      <aside className="h-full flex-1/3 w-15 px-5 py-5">Sidebar</aside>
      <div className="flex flex-col gap-3 flex-2/3">
        <nav className="px-5 py-5">Navbar</nav>
        <div className="px-5 py-5">Content</div>
      </div>
    </div>
  );
}
