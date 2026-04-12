import React, { useRef, useId, useEffect, useLayoutEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getCurrencySymbol,
  getLocaleSeparators,
  formatWithGrouping,
  unformatToRaw,
  type LocaleSeparators,
} from '@/lib/currency';
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

/** Count non-grouping (significant) characters to the left of `pos`. */
function countSignificantChars(str: string, pos: number, seps: LocaleSeparators): number {
  let count = 0;
  for (let i = 0; i < pos && i < str.length; i++) {
    if (str[i] !== seps.group) count++;
  }
  return count;
}

/** Find the index in `str` where `target` significant characters have been seen. */
function findCursorPosition(str: string, target: number, seps: LocaleSeparators): number {
  if (target === 0) return 0;
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] !== seps.group) count++;
    if (count === target) return i + 1;
  }
  return str.length;
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

  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  });

  const seps = getLocaleSeparators();
  const currencySymbol = getCurrencySymbol(currency);
  const numericValue = parseDisplayValue(value);
  const displayValue = formatWithGrouping(value);

  // Restore cursor position after React re-renders (before paint)
  useLayoutEffect(() => {
    if (cursorRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
      cursorRef.current = null;
    }
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newDisplay = e.target.value;
    const cursorPos = e.target.selectionStart ?? newDisplay.length;

    // Strip grouping separators to get the raw decimal string
    const raw = unformatToRaw(newDisplay, seps);

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
    if (!regex.test(raw)) return;

    // Normalize leading zeros: "-007.5" → "-7.5", "007" → "7"
    // Preserve lone "0" and "0." prefix for decimal entry
    const normalized = raw.replace(/^(-?)0+(\d)/, '$1$2');

    // Compute cursor position in the reformatted string
    const reformatted = formatWithGrouping(normalized);
    const sigBefore = countSignificantChars(newDisplay, cursorPos, seps);
    const newCursor = findCursorPosition(reformatted, sigBefore, seps);

    // When the user backspaces over a grouping separator the raw value is
    // unchanged (separator was cosmetic). In that case React won't re-render,
    // so we manually nudge the cursor back past the separator.
    if (normalized === value) {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursor, newCursor);
      }
      return;
    }

    cursorRef.current = newCursor;
    onChange(normalized);
  }

  function handleBlur() {
    // Keep empty field empty so the placeholder remains visible
    if (value === '' || value === '-') {
      onChange('');
      return;
    }
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
        'border-input dark:bg-card flex items-center rounded-xl border px-4 py-3',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="text-muted-foreground mr-2 shrink-0 text-3xl leading-none font-bold">
        {currencySymbol}
      </span>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        inputMode="decimal"
        role="spinbutton"
        aria-valuemin={allowNegative ? undefined : 0}
        aria-valuenow={value === '' ? undefined : numericValue}
        aria-valuetext={
          value === '' || value === '-' ? undefined : `${currencySymbol}${displayValue}`
        }
        aria-label={ariaLabel}
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 border-0 bg-transparent text-3xl leading-none font-bold outline-none"
      />
      <div className="ml-2 flex flex-col gap-2">
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
        >
          <ChevronUp />
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
        >
          <ChevronDown />
        </Button>
      </div>
    </div>
  );
}
