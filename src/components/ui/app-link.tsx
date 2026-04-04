import { NavLink, type NavLinkProps } from 'react-router';
import { useAppNavigate } from '@/lib/navigation';

/**
 * Drop-in replacement for NavLink/Link that routes through our
 * View Transition–aware `useAppNavigate` instead of React Router's
 * default navigation.
 *
 * Supports the `isActive` render-prop className from NavLink.
 * `to` must be a string — object `To` values are not supported
 * because the view-transition system needs a path string.
 */
export function AppLink({
  to,
  onClick,
  replace,
  state,
  ...props
}: Omit<NavLinkProps, 'to'> & { to: string }) {
  const navigate = useAppNavigate();

  return (
    <NavLink
      to={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        navigate(to, { replace, state });
      }}
      {...props}
    />
  );
}
