import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  BarChart3,
  Trash2,
  Award,
  User,
  LogOut,
  Moon,
  Sun,
  Leaf,
  Menu,
  FileText,
  Bell,
  MapPin,
  Clock,
  AlertTriangle
} from 'lucide-react';

// --- NEW SUB-COMPONENT: Notification Bell ---
const NotificationBell = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const fetchNotifications = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Assuming token is stored in localStorage, adjust based on your AuthContext
          const token = localStorage.getItem('vasundhara_access_token');

          const response = await fetch(
            `http://127.0.0.1:8000/api/notifications/nearby/?lat=${latitude}&lon=${longitude}&radius=5`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            setAlerts(data.alerts || []);
          }
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      },
      (error) => console.log("Location permission denied"),
      { enableHighAccuracy: false, timeout: 5000 }
    );
  };

  // Poll every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      default: return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-4 w-4" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
              {alerts.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <h4 className="font-semibold leading-none">{t('Nearby Alerts')}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {alerts.length} {t('issues within 5km')}
          </p>
        </div>
        <ScrollArea className="h-[300px]">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Leaf className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">{t('No nearby issues found')}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h5 className="font-medium text-sm mb-1">{alert.issue_type}</h5>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{alert.distance_km} km away</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
// ---------------------------------------------


const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavigation = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const navLinks = [
    { path: '/dashboard', icon: <Home className="h-4 w-4" />, label: t('Dashboard') },
    { path: '/carbon', icon: <BarChart3 className="h-4 w-4" />, label: t('Carbon') },
    { path: '/waste', icon: <Trash2 className="h-4 w-4" />, label: t('Issue') },
    { path: '/route', icon: <Leaf className="h-4 w-4" />, label: t('Routes') },
    { path: '/reports', icon: <FileText className="h-4 w-4" />, label: t('Reports') },
    { path: '/credits', icon: <Award className="h-4 w-4" />, label: t('Credits') },
    { path: '/profile', icon: <User className="h-4 w-4" />, label: t('Profile') },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="bg-gradient-eco p-2 rounded-lg shadow-eco group-hover:scale-110 transition-transform">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground whitespace-nowrap">Vasundhara 2.0</h1>
              <p className="text-xs text-muted-foreground hidden md:block truncate max-w-[150px]">{t('Agentic Civic Platform')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-shrink-0">
            {isAuthenticated && (
              <>
                {navLinks.map((link) => (
                  <Link key={`${link.path}-${language}`} to={link.path}>
                    <Button variant="ghost" size="sm" className="gap-1 px-2 xl:px-3" title={link.label}>
                      {link.icon}
                      <span className="hidden xl:inline truncate max-w-[80px]">{link.label}</span>
                    </Button>
                  </Link>
                ))}

                {/* INSERT NOTIFICATION BELL HERE */}
                <NotificationBell />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1 px-2 xl:px-3"
                  title={t('Logout')}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden xl:inline truncate max-w-[60px]">{t('Logout')}</span>
                </Button>
              </>
            )}

            {/* Language Selector */}
            <LanguageSelector />

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {!isAuthenticated && (
              <Link to="/auth">
                <Button className="gradient-eco">
                  {t('Sign In')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile/Tablet Navigation */}
          <div className="flex lg:hidden items-center gap-2">

            {/* Show Bell on Mobile too if logged in */}
            {isAuthenticated && <NotificationBell />}

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-9 w-9"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {!isAuthenticated && (
              <Link to="/auth">
                <Button className="gradient-eco" size="sm">
                  {t('Sign In')}
                </Button>
              </Link>
            )}

            {isAuthenticated && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <div className="bg-gradient-eco p-2 rounded-lg">
                        <Leaf className="h-5 w-5 text-primary-foreground" />
                      </div>
                      Vasundhara 2.0
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-2 mt-6">
                    {navLinks.map((link) => (
                      <Button
                        key={`${link.path}-${language}`}
                        variant="ghost"
                        className="justify-start gap-3 h-12"
                        onClick={() => handleNavigation(link.path)}
                      >
                        {link.icon}
                        {link.label}
                      </Button>
                    ))}
                    <div className="border-t border-border my-2" />
                    <div className="px-3 py-2">
                      <LanguageSelector />
                    </div>
                    <div className="border-t border-border my-2" />
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12 text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      {t('Logout')}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;