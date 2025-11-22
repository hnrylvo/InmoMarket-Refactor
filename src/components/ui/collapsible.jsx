import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const CollapsibleContext = React.createContext()

const Collapsible = React.forwardRef(({ className, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <CollapsibleContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
})
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen } = React.useContext(CollapsibleContext)
  
  return (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-all hover:bg-muted",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
    </button>
  )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen } = React.useContext(CollapsibleContext)
  
  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all",
        isOpen ? "animate-collapsible-down" : "animate-collapsible-up",
        className
      )}
      style={{ height: isOpen ? "auto" : "0" }}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent } 