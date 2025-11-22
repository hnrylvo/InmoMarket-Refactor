import React from 'react'
import { Input } from '@/components/ui/input'

export default function PriceInput({ value, onChange, required }) {
  const formatToCurrency = (rawValue) => {
    if (!rawValue) return '0.00'
    const padded = rawValue.padStart(3, '0')
    const dollars = padded.slice(0, -2)
    const cents = padded.slice(-2)
    const formatted = parseInt(dollars, 10).toLocaleString() + '.' + cents
    return formatted
  }

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (onChange) {
      onChange(digits)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newValue = value ? value.slice(0, -1) : ''
      if (onChange) {
        onChange(newValue)
      }
    }
  }

  return (
    <div className="space-y-2">
      <Input
        id="price"
        inputMode="numeric"
        placeholder="$0.00"
        value={`$${formatToCurrency(value || '')}`}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        required={required}
      />
    </div>
  )
}
