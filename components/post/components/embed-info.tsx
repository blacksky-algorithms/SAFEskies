import { Icon } from '@/components/icon';

export const Info = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='w-full rounded-lg border border-gray-800 py-2 px-2.5 flex-row flex gap-2'>
      <Icon icon='InformationCircleIcon' className='w-5 h-5' />
      <p className='text-sm text-textLight'>{children}</p>
    </div>
  );
};
