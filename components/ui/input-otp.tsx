"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const InputOTPContext = React.createContext<{
  slots: number
  value: string
  onChange: (value: string) => void
}>({
  slots: 6,
  value: "",
  onChange: () => {},
})

interface InputOTPProps extends React.InputHTMLAttributes<HTMLInputElement> {
  maxLength?: number
  render?: ({ slots }: { slots: React.ReactNode[] }) => React.ReactNode
}

const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
  ({ className, maxLength = 6, render, ...props }, ref) => {
    const [value, setValue] = React.useState("")

    const handleChange = (newValue: string) => {
      if (newValue.length <= maxLength) {
        setValue(newValue)
        props.onChange?.({
          target: { value: newValue },
        } as React.ChangeEvent<HTMLInputElement>)
      }
    }

    const slots = Array.from({ length: maxLength }, (_, index) => <InputOTPSlot key={index} index={index} />)

    return (
      <InputOTPContext.Provider value={{ slots: maxLength, value, onChange: handleChange }}>
        <div className={cn("flex items-center gap-2", className)}>
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="sr-only"
            {...props}
          />
          {render ? render({ slots }) : <InputOTPGroup>{slots}</InputOTPGroup>}
        </div>
      </InputOTPContext.Provider>
    )
  },
)
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />,
)
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { index: number }>(
  ({ index, className, ...props }, ref) => {
    const inputOTPContext = React.useContext(InputOTPContext)
    const char = inputOTPContext.value[index]
    const isActive = index === inputOTPContext.value.length

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-9 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
          isActive && "z-10 ring-2 ring-ring ring-offset-background",
          className,
        )}
        {...props}
      >
        {char}
        {isActive && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-px animate-pulse bg-foreground duration-1000" />
          </div>
        )}
      </div>
    )
  },
)
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
      <div className="h-4 w-px bg-border" />
    </div>
  ),
)
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
