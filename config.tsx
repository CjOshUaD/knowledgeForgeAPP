import { usePathname } from 'next/navigation';

import { Bell, Briefcase, Home, Settings, Users, LogOut } from 'lucide-react';

export const NavItems = () => {
  const pathname = usePathname();

  function isNavItemActive(pathname: string, nav: string) {
    return pathname.includes(nav);
  }

  return [
    {
      name: 'Home',
      href: '/admin',
      icon: <Home size={20} />,
      active: pathname === '/admin',
      position: 'top',
    },
    {
      name: 'Manage Students',
      href: '/manageStudents',
      icon: <Users size={20} />,
      active: isNavItemActive(pathname, '/manageStudents'),
      position: 'top',
    },
    {
        name: 'Manage Teacher',
        href: '/manageTeachers',
        icon: <Users size={20} />,
        active: isNavItemActive(pathname, '/manageTeachers'),
        position: 'top',
      },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: <Bell size={20} />,
      active: isNavItemActive(pathname, '/notifications'),
      position: 'top',
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: <Briefcase size={20} />,
      active: isNavItemActive(pathname, '/projects'),
      position: 'top',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: <Settings size={20} />,
      active: isNavItemActive(pathname, '/settings'),
      position: 'top',
    },
    {
        name: 'Log Out',
        href: '/',
        icon: <LogOut size={20} />,
        active: isNavItemActive(pathname, '/logOut'),
        position: 'bottom',
      },
  ];
};