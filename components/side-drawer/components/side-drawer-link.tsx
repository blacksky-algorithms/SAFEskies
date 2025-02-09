import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import cc from 'classcat';
import { UserRole } from '@/lib/types/permission';
import { PermissionPill } from '@/components/permission-pill';

interface SideDrawerLinkProps {
  label: string;
  href?: string;
  nestedLinks?: { label: string; href: string }[];
  onClick?: (path: string) => void;
  permission?: UserRole;
}

export const SideDrawerLink = ({
  label,
  href,
  nestedLinks,
  onClick,
  permission,
}: SideDrawerLinkProps) => {
  const pathname = usePathname();
  const params = useSearchParams();

  const handleLinkClick = (path: string) => {
    if (onClick) onClick(path);
  };

  return (
    <li className='space-y-1'>
      {nestedLinks && !href ? (
        <p
          className={cc([
            'block py-2 px-4 text-app rounded-lg',
            {
              'cursor-pointer hover:bg-app-secondary-hover ': !!href,
            },
          ])}
        >
          {label}
        </p>
      ) : (
        <a
          onClick={() => {
            handleLinkClick(href || '');
          }}
          href={href || ''}
          className={cc([
            'block py-2 px-4  text-app rounded-lg',
            {
              'cursor-pointer hover:bg-app-secondary-hover ': !!href,
              'font-semibold text-app-primary bg-app-secondary-hover':
                href === pathname ||
                href === `${pathname}?${params.toString()}`,
            },
          ])}
        >
          {label}
        </a>
      )}
      {nestedLinks && (
        <div className='pl-6 space-y-1'>
          {nestedLinks.map((link) => {
            return (
              <a
                key={link.href}
                onClick={() => handleLinkClick(link.href)}
                href={link.href}
                className={cc([
                  'block py-2 px-4 hover:bg-app-secondary-hover rounded-lg',
                  {
                    'font-semibold text-app-primary bg-app-secondary-hover ':
                      link.href === pathname ||
                      link.href === `${pathname}?${params.toString()}`,
                  },
                ])}
              >
                <span className='flex gap-4'>
                  {permission && <PermissionPill type={permission} />}
                  {link.label}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </li>
  );
};
