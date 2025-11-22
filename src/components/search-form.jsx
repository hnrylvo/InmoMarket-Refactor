import { Search } from "lucide-react";
import { Label } from "./ui/label";
import { SidebarInput } from "./ui/sidebar";

export function SearchForm(props) {
    return (
      <form {...props} className="mx-4 sm:mx-8 md:mx-12 lg:mx-20 flex-1 min-w-0">
          <div className="relative w-full">
              <Label htmlFor="search" className="sr-only">
                  Search
              </Label>
              <SidebarInput
                id="search"
                placeholder="Buscar..."
                className="h-8 w-full pl-9 rounded-full"
                style={{ boxSizing: "border-box" }}
              />
              <Search
                className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50"
              />
          </div>
      </form>
    );
}
