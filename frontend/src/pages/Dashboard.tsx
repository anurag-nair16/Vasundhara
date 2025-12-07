import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import ScoreCard from '@/components/ScoreCard';
import apiClient from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Leaf,
  Users,
  TrendingUp,
  AlertCircle,
  Award,
  Bell,
  MapPin,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_reports: 0,
    resolved: 0,
    in_progress: 0,
    pending: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/auth/report-stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;


  const notifications = [
    { id: 1, type: 'success', message: 'Bin overflow resolved - Crew dispatched successfully', time: '10 min ago' },
    { id: 2, type: 'info', message: `Your carbon footprint decreased by 12% this month`, time: '2 hours ago' },
    { id: 3, type: 'warning', message: 'New waste hotspot detected in your area', time: '5 hours ago' }
  ];

  const quickActions = [
    { label: t('Report Issue'), icon: <AlertCircle className="h-5 w-5" />, path: '/waste' },
    { label: t('View Carbon Stats'), icon: <TrendingUp className="h-5 w-5" />, path: '/carbon' },
    { label: t('Check Leaderboard'), icon: <Users className="h-5 w-5" />, path: '/credits' },
    { label: t('Redeem Rewards'), icon: <Award className="h-5 w-5" />, path: '/credits' }
  ];

  const unifiedScore = user.ecoScore + user.civicScore;
  const co2Reduced = stats.resolved * 50; // 50kg per resolved issue

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-muted-foreground">
                Your sustainability journey continues. Here's your impact today.
              </p>
            </div>
            <Button className="gradient-eco shadow-eco gap-2" onClick={() => navigate('/waste')}>
              <MapPin className="h-4 w-4" />
              {t('Report Issue')}
            </Button>
          </div>
        </motion.div>

        {/* Score Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ScoreCard
            title="Unified Score"
            score={unifiedScore}
            maxScore={2000}
            trend={45}
            icon={<Zap className="h-6 w-6" />}
            color="primary"
            description="Combined Eco + Civic Score"
          />
          <ScoreCard
            title="Eco Score"
            score={user.ecoScore}
            maxScore={1000}
            trend={25}
            icon={<Leaf className="h-6 w-6" />}
            color="leaf"
            description="Environmental Impact"
          />
          <ScoreCard
            title="Civic Score"
            score={user.civicScore}
            maxScore={1000}
            trend={20}
            icon={<Users className="h-6 w-6" />}
            color="water"
            description="Community Participation"
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="p-4 gradient-card border-border/50 hover:shadow-eco transition-all duration-300 cursor-pointer"
                onClick={() => navigate(action.path)}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Recent Updates</h2>
          </div>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card key={notification.id} className="p-4 gradient-card border-border/50">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${notification.type === 'success' ? 'bg-success/10 text-success' :
                    notification.type === 'warning' ? 'bg-warning/10 text-warning' :
                      'bg-info/10 text-info'
                    }`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Impact Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-6 gradient-card border-primary/20 shadow-eco">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Your Impact This Month</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{co2Reduced} kg</p>
                <p className="text-sm text-muted-foreground mt-1">CO₂ Reduced</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.total_reports}</p>
                <p className="text-sm text-muted-foreground mt-1">Issues Reported</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground mt-1">Issues Resolved</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
