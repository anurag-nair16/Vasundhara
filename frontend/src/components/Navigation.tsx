import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import {
  Home,
  BarChart3,
  Trash2,
  Award,
  User,
  LogOut,
  Moon,
  Sun,
  Leaf
} from 'lucide-react';

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-eco p-2 rounded-lg shadow-eco group-hover:scale-110 transition-transform">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Vasundhara 2.0</h1>
              <p className="text-xs text-muted-foreground">{t('Agentic Civic Platform')}</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Home className="h-4 w-4" />
                    {t('Dashboard')}
                  </Button>
                </Link>
                <Link to="/carbon">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {t('Carbon')}
                  </Button>
                </Link>
                <Link to="/waste">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t('Waste')}
                  </Button>
                </Link>
                <Link to="/reports">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t('Reports')}
                  </Button>
                </Link>
                <Link to="/credits">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Award className="h-4 w-4" />
                    {t('Credits')}
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {t('Profile')}
                  </Button>
                </Link>
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
