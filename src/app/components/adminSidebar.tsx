import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { NavItems } from '../../../config';
import { cn } from '@/app/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function SideNav() {
  const navItems = NavItems();
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // Default state

  useEffect(() => {
    // Only run on the client side
    const saved = window.localStorage.getItem('sidebarExpanded');
    if (saved !== null) {
      setIsSidebarExpanded(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Update localStorage whenever isSidebarExpanded changes
    window.localStorage.setItem('sidebarExpanded', JSON.stringify(isSidebarExpanded));
  }, [isSidebarExpanded]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => !prev);
  };

  return (
    <div className="pr-4">
      <div
        className={cn(
          isSidebarExpanded ? 'w-[200px]' : 'w-[68px]',
          'border-r transition-all duration-300 ease-in-out hidden sm:flex h-full bg-accent'
        )}
      >
        <aside className="flex h-full flex-col w-full break-words px-4 overflow-x-hidden">
          {/* Top Navigation Items */}
          <div className="mt-4 relative pb-2">
            <div className="flex flex-col space-y-1">
              {navItems.map((item, idx) => item.position === 'top' && (
                <SideNavItem
                  key={idx}
                  label={item.name}
                  icon={item.icon}
                  path={item.href}
                  active={item.active}
                  isSidebarExpanded={isSidebarExpanded}
                />
              ))}
            </div>
          </div>
          {/* Bottom Navigation Items */}
          <div className="sticky bottom-0 mt-auto whitespace-nowrap mb-4 transition duration-200 block">
            {navItems.map((item, idx) => item.position === 'bottom' && (
              <SideNavItem
                key={idx}
                label={item.name}
                icon={item.icon}
                path={item.href}
                active={item.active}
                isSidebarExpanded={isSidebarExpanded}
              />
            ))}
          </div>
        </aside>
        <div className="mt-[calc(calc(90vh)-40px)] relative">
          <button
            type="button"
            aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="absolute bottom-32 right-[-12px] flex h-6 w-6 items-center justify-center border border-muted-foreground/20 rounded-full bg-accent shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
            onClick={toggleSidebar}
          >
            {isSidebarExpanded ? (
              <ArrowLeft size={16} className='stroke-foreground'/>
            ) : (
              <ArrowRight size={16} className='stroke-foreground'/>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export const SideNavItem: React.FC<{
  label: string;
  icon: React.ReactNode; // Changed from 'any' to 'React.ReactNode'
  path: string;
  active: boolean;
  isSidebarExpanded: boolean;
}> = ({ label, icon, path, active, isSidebarExpanded }) => {
  return (
    <>
      {isSidebarExpanded ? (
        <Link
          href={path}
          aria-label={label} // Added aria -label for accessibility
          className={`h-full relative flex items-center whitespace-nowrap rounded-md ${
            active
              ? 'font-base text-sm bg-neutral-200 shadow-sm text-neutral-700 dark:bg-neutral-800 dark:text-white'
              : 'hover:bg-neutral-200 hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
          }`}
        >
          <div className="relative font-base text-sm py-1.5 px-2 flex flex-row items-center space-x-2 rounded-md duration-100">
            {icon}
            <span>{label}</span>
          </div>
        </Link>
      ) : (
        <TooltipProvider delayDuration={70}>
          <Tooltip>
            <TooltipTrigger>
              <Link
                href={path}
                aria-label={label} // Added aria-label for accessibility
                className={`h-full relative flex items-center whitespace-nowrap rounded-md ${
                  active
                    ? 'font-base text-sm bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-white'
                    : 'hover:bg-neutral-200 hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
                }`}
              >
                <div className="relative font-base text-sm p-2 flex flex-row items-center space-x-2 rounded-md duration-100">
                  {icon}
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="px-3 py-1.5 text-xs"
              sideOffset={10}
            >
              <span>{label}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
};