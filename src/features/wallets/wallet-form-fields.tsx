interface FieldLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
}

/** Uppercase field label with consistent tracking and muted color. */
export function FieldLabel({ htmlFor, children }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-muted-foreground mb-2 block text-xs font-medium tracking-wider uppercase"
    >
      {children}
    </label>
  );
}
