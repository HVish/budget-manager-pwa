import React, { useRef, useId, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrencySymbol } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { Currency } from '@/api/types';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  currency: Currency;
  placeholder?: string;
  disabled?: boolean;
  allowNegative?: boolean;
  id?: string;
  'aria-label'?: string;
}

const DECIMAL_REGEX = /^\d*\.?\d{0,2}$/;
const DECIMAL_NEGATIVE_REGEX = /^-?\d*\.?\d{0,2}$/;

function parseDisplayValue(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function formatToTwoDecimals(value: number): string {
  return value.toFixed(2);
}

export function CurrencyInput({
  value,
  onChange,
  currency,
  placeholder = '0.00',
  disabled = false,
  allowNegative = false,
  id,
  'aria-label': ariaLabel,
}: CurrencyInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  });

  const currencySymbol = getCurrencySymbol(currency);
  const numericValue = parseDisplayValue(value);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;

    // Allow empty input
    if (raw === '') {
      onChange('');
      return;
    }

    // Allow bare minus as the start of a negative number
    if (allowNegative && raw === '-') {
      onChange(raw);
      return;
    }

    // Validate against the appropriate decimal pattern
    const regex = allowNegative ? DECIMAL_NEGATIVE_REGEX : DECIMAL_REGEX;
    if (regex.test(raw)) {
      onChange(raw);
    }
  }

  function handleBlur() {
    const parsed = parseDisplayValue(value);
    const floored = allowNegative ? parsed : Math.max(0, parsed);
    onChange(formatToTwoDecimals(floored));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      step(-1);
    }
  }

  function step(direction: 1 | -1) {
    const current = parseDisplayValue(valueRef.current);
    const next = current + direction * 1;
    const floored = allowNegative ? next : Math.max(0, next);
    onChange(formatToTwoDecimals(floored));
  }

  function startHold(direction: 1 | -1) {
    step(direction);
    holdTimerRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => step(direction), 150);
    }, 400);
  }

  function stopHold() {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current !== null) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }

  // Clean up timers on unmount to avoid state updates after unmount
  useEffect(() => stopHold, []);

  return (
    <div
      className={cn(
        'border-input dark:bg-card flex h-20 items-center rounded-xl border py-3 pr-2 pl-4',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="text-muted-foreground mr-2 shrink-0 text-3xl leading-none font-bold">
        {currencySymbol}
      </span>
      <input
        id={inputId}
        type="text"
        inputMode="decimal"
        role="spinbutton"
        aria-valuemin={allowNegative ? undefined : 0}
        aria-valuenow={numericValue}
        aria-label={ariaLabel}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 border-0 bg-transparent text-3xl leading-none font-bold outline-none"
      />
      <div className="ml-2 flex flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          tabIndex={-1}
          aria-label="Increase amount"
          aria-controls={inputId}
          disabled={disabled}
          onPointerDown={() => startHold(1)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          className="h-8 min-h-11 w-8 min-w-11"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          tabIndex={-1}
          aria-label="Decrease amount"
          aria-controls={inputId}
          disabled={disabled}
          onPointerDown={() => startHold(-1)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          className="h-8 min-h-11 w-8 min-w-11"
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
