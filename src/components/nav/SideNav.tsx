"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { 
  Home, 
  Settings, 
  FileText, 
  Bell, 
  Film,
  Brain,
  LogOut
} from 'lucide-react'; // Import icons

export default function SideNav() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut();
  };
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Crawls', href: '/crawls', icon: Film },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'LLM Providers', href: '/llm-providers', icon: Brain },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <div className="h-full flex flex-col justify-between py-4">
      <div>
        <div className="px-4 mb-8">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-semibold">AIrCrawl</span>
          </Link>
        </div>
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-700'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-4 mt-auto">
        <div className="flex items-center mb-4 p-2">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <a
          href="#"
          onClick={handleSignOut}
          className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-red-600 hover:bg-red-100"
        >
          <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-600" />
          Sign out
        </a>
      </div>
    </div>
  );
}