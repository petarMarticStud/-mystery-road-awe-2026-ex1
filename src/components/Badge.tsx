interface BadgeProps {
  label: string;
  className: string;
}

export function Badge({ label, className }: BadgeProps) {
  return (
    <span className={`badge ${className}`}>
      {label}
    </span>
  );
}