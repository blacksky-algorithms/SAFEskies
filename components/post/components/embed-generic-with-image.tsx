import Link from 'next/link';

export const GenericWithImageEmbed = ({
  title,
  subtitle,
  href,
  image,
  description,
}: {
  title: string;
  subtitle: string;
  href: string;
  image?: string;
  description?: string;
}) => {
  // TODO: This renders a link to a feed or list, add a not yet supported modal that informs user will be sent to bluesky
  return (
    <Link
      href={href}
      className='w-full rounded-lg border py-2 px-3 flex flex-col gap-2'
    >
      <div className='flex gap-2.5 items-center'>
        {image ? (
          <img
            src={image}
            alt={title}
            className='w-8 h-8 rounded-lg  shrink-0'
          />
        ) : (
          <div className='w-8 h-8 rounded-lg bg-brand shrink-0' />
        )}
        <div className='flex-1'>
          <p className='font-bold text-sm'>{title}</p>
          <p className='text-textLight text-sm'>{subtitle}</p>
        </div>
      </div>
      {description && <p className='text-textLight text-sm'>{description}</p>}
    </Link>
  );
};
