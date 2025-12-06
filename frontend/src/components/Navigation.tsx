import { useState } from 'react';
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
  FileText
} from 'lucide-react';

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const navLinks = [
    { path: '/dashboard', icon: <Home className="h-4 w-4" />, label: t('Dashboard') },
    { path: '/carbon', icon: <BarChart3 className="h-4 w-4" />, label: t('Carbon') },
    { path: '/waste', icon: <Trash2 className="h-4 w-4" />, label: t('Waste') },
    { path: '/route', icon: <Leaf className="h-4 w-4" />, label: t('Routes') },
    { path: '/reports', icon: <FileText className="h-4 w-4" />, label: t('Reports') },
    { path: '/credits', icon: <Award className="h-4 w-4" />, label: t('Credits') },
    { path: '/profile', icon: <User className="h-4 w-4" />, label: t('Profile') },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-eco p-2 rounded-lg shadow-eco group-hover:scale-110 transition-transform">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Vasundhara 2.0</h1>
              <p className="text-xs text-muted-foreground">{t('Agentic Civic Platform')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && (
              <>
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      {link.icon}
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {t('Logout')}
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

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
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
                        key={link.path}
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
