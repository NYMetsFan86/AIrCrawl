import * as React from "react"
import { cn } from "@/lib/utils"

// Error boundary for table components
class TableErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div role="alert">Error rendering table component</div>
    }
    return this.props.children
  }
}

// Type definitions for props validation
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  "aria-label"?: string
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, "aria-label": ariaLabel, ...props }, ref) => {
    if (process.env.NODE_ENV === 'development' && !ariaLabel) {
      console.warn('Table: Missing aria-label prop for accessibility')
    }

    return (
      <TableErrorBoundary>
        <div className="relative w-full overflow-auto">
          <table
            ref={ref}
            className={cn("w-full caption-bottom text-sm", className)}
            aria-label={ariaLabel}
            {...props}
          />
        </div>
      </TableErrorBoundary>
    )
  }
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  try {
    return (
      <thead 
        ref={ref} 
        className={cn("[&_tr]:border-b", className)} 
        role="rowgroup"
        {...props} 
      />
    )
  } catch (error) {
    console.error('Error rendering TableHeader:', error)
    return null
  }
})
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  try {
    return (
      <tbody 
        ref={ref} 
        className={cn("[&_tr:last-child]:border-0", className)} 
        role="rowgroup"
        {...props} 
      />
    )
  } catch (error) {
    console.error('Error rendering TableBody:', error)
    return null
  }
})
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  try {
    return (
      <tfoot
        ref={ref}
        className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
        role="rowgroup"
        {...props}
      />
    )
  } catch (error) {
    console.error('Error rendering TableFooter:', error)
    return null
  }
})
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => {
  try {
    return (
      <tr
        ref={ref}
        className={cn(
          "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
          className
        )}
        role="row"
        {...props}
      />
    )
  } catch (error) {
    console.error('Error rendering TableRow:', error)
    return null
  }
})
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  try {
    return (
      <th
        ref={ref}
        className={cn(
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          className
        )}
        scope="col"
        {...props}
      />
    )
  } catch (error) {
    console.error('Error rendering TableHead:', error)
    return null
  }
})
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  try {
    return (
      <td
        ref={ref}
        className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
        role="cell"
        {...props}
      />
    )
  } catch (error) {
    console.error('Error rendering TableCell:', error)
    return null
  }
})
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => {
  try {
    return (
      <caption
        ref={ref}
        className={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
      />
    )
  } catch (error) {
    console.error('Error rendering TableCaption:', error)
    return null
  }
})
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}