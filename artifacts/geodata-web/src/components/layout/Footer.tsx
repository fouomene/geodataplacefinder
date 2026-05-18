export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} GeoDataPlacefinder</span>
          <span className="hidden md:inline">&middot;</span>
          <span>Powered by Overture Maps & DuckDB</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
