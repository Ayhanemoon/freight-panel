import clsx from 'clsx';
import { NavLink, useLocation } from "react-router-dom"

interface SidebarProps {
  open: boolean;
  mobileMode: boolean;
  onClose: () => void;
}

const MainSidebar = ({ open, mobileMode, onClose }: SidebarProps) => {
  const navItems = [
    { to: '/dashboard', label: 'داشبورد' },
    { to: '/dashboard/users', label: 'مدیریت کاربران' },
  ]
  const location = useLocation();
  const isActive = (path: string) => {
    return location.pathname === path;
  };
   
  return (
    <aside
      className={clsx('layout__sidebar', {
        ['layout__sidebar--open']: open,
        ['layout__sidebar--mobile']: mobileMode,
      })}
      onClick={mobileMode ? onClose : undefined}
    >
      <nav>
        <div className='navigation-list'>
          {navItems.map((item, index) => (
              <NavLink key={index} to={item.to} className={clsx('navigation-list__item', { 'exact-path': isActive(item.to) })}>
                {item.label}
              </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};
export default MainSidebar;