import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  // Expand the parent if the current route matches any of the nested links
  useEffect(() => {
    if (
      nestedLinks &&
      nestedLinks.some((link) => pathname.startsWith(link.href))
    ) {
      setIsExpanded(true);
    }
  }, [pathname, nestedLinks]);

  const handleLinkClick = (path: string) => {
    if (onClick) onClick(path);
    if (!nestedLinks) setIsExpanded(false);
  };

  return (
    <div className='space-y-1'>
      <a
        onClick={(e) => {
          if (nestedLinks) {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          } else {
            handleLinkClick(href || '');
          }
        }}
        href={href}
        className={cc([
          'block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg',
          { 'cursor-pointer': nestedLinks },
        ])}
      >
        {label}
      </a>
      {nestedLinks && isExpanded && (
        <div className='pl-6 space-y-1'>
          {nestedLinks.map((link) => (
            <a
              key={link.href}
              onClick={() => handleLinkClick(link.href)}
              href={link.href}
              className={cc([
                'block px-4 py-2 hover:bg-app-secondary-hover rounded-lg',
                {
                  'font-semibold text-app-primary': pathname.startsWith(
                    link.href
                  ),
                },
              ])}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
