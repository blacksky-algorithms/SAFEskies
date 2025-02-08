import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import cc from 'classcat';

interface SideDrawerLinkProps {
  label: string;
  href?: string;
  nestedLinks?: { label: string; href: string }[];
  onClick?: (path: string) => void;
}

export const SideDrawerLink = ({
  label,
  href,
  nestedLinks,
  onClick,
}: SideDrawerLinkProps) => {
  const pathname = usePathname();
  const params = useSearchParams();

  const handleLinkClick = (path: string) => {
    if (onClick) onClick(path);
  };

  return (
    <li className='space-y-1'>
      {nestedLinks ? (
        <p
          className={cc([
            'block py-2 text-app rounded-lg',
            { 'cursor-pointer hover:bg-app-secondary-hover ': !nestedLinks },
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
            'block py-2 text-app rounded-lg',
            { 'cursor-pointer hover:bg-app-secondary-hover ': !nestedLinks },
          ])}
        >
          {label}
        </a>
      )}
      {nestedLinks && (
        <div className='pl-4 space-y-1'>
          {nestedLinks.map((link) => {
            return (
              <a
                key={link.href}
                onClick={() => handleLinkClick(link.href)}
                href={link.href}
                className={cc([
                  'block px-4 py-2 hover:bg-app-secondary-hover rounded-lg',
                  {
                    'font-semibold text-app-primary':
                      link.href === pathname ||
                      link.href === `${pathname}?${params.toString()}`,
                  },
                ])}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      )}
    </li>
  );
};
