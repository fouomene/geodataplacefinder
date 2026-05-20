export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} GeoDataPlacefinder</span>
          <span className="hidden md:inline">&middot;</span>
          <span>Uses <a href="https://overturemaps.org/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Overture Maps</a> data</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="mailto:support@geodataplacefinder.org" className="hover:text-primary transition-colors">support@geodataplacefinder.org</a>
          <a href="https://github.com/fouomene/geodataplacefinder?tab=contributing-ov-file" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Contributing</a>
          <a href="https://github.com/fouomene/geodataplacefinder?tab=GPL-3.0-1-ov-file" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GPL-3.0 License</a>
        </div>
      </div>
    </footer>
  );
}
