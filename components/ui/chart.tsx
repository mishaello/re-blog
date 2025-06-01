"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ChartConfig = {
    [k in string]: {
        label?: React.ReactNode
        icon?: React.ComponentType
        color?: string
    }
}

type ChartContextProps = {
    config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
    const context = React.useContext(ChartContext)
    if (!context) {
        throw new Error("useChart must be used within a <ChartContainer />")
    }
    return context
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    config: ChartConfig
    children: React.ReactNode
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
    ({ className, children, config, ...props }, ref) => {
        return (
            <ChartContext.Provider value={{ config }}>
                <div ref={ref} className={cn("flex aspect-video justify-center text-xs", className)} {...props}>
                    {children}
                </div>
            </ChartContext.Provider>
        )
    },
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = ({ children }: { children?: React.ReactNode }) => {
    return <div className="rounded-lg border bg-background p-2 shadow-md">{children}</div>
}

const ChartTooltipContent = ({ children }: { children?: React.ReactNode }) => {
    return <div className="text-sm">{children}</div>
}

const ChartLegend = ({ children }: { children?: React.ReactNode }) => {
    return <div className="flex items-center justify-center gap-4 pt-3">{children}</div>
}

const ChartLegendContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
    payload?: Array<{
        value: string
        color: string
        dataKey?: string
    }>
    hideIcon?: boolean
}
>(({ className, hideIcon = false, payload, ...props }, ref) => {
    const { config } = useChart()

    if (!payload?.length) {
        return null
    }

    return (
        <div ref={ref} className={cn("flex items-center justify-center gap-4", className)} {...props}>
            {payload.map((item: { value: string; color: string; dataKey?: string }, index: number) => {
                const itemConfig = config[item.dataKey || item.value]

                return (
                    <div key={`${item.value}-${index}`} className="flex items-center gap-1.5">
                        {itemConfig?.icon && !hideIcon ? (
                            <itemConfig.icon />
                        ) : (
                            <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
                        )}
                        <span className="text-sm">{itemConfig?.label || item.value}</span>
                    </div>
                )
            })}
        </div>
    )
})
ChartLegendContent.displayName = "ChartLegendContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, useChart }
