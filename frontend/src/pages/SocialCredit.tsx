import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  TrendingUp,
  Trophy,
  Star,
  Gift,
  Users,
  Leaf,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const SocialCredit = () => {
  const { user } = useAuth();

  if (!user) return null;

  const unifiedScore = user.ecoScore + user.civicScore;
  const nextMilestone = 1500;
  const progress = (unifiedScore / nextMilestone) * 100;

  const activities = [
    { icon: <Leaf className="h-5 w-5" />, action: 'Installed solar panels', points: '+50', type: 'eco', time: '2 days ago' },
    { icon: <Users className="h-5 w-5" />, action: 'Reported waste issue', points: '+15', type: 'civic', time: '3 days ago' },
    { icon: <Zap className="h-5 w-5" />, action: 'Used public transport', points: '+10', type: 'eco', time: '5 days ago' },
    { icon: <Trophy className="h-5 w-5" />, action: 'Community cleanup', points: '+30', type: 'civic', time: '1 week ago' }
  ];

  const leaderboard = [
    { rank: 1, name: 'Priya Sharma', score: 1850, avatar: '👩' },
    { rank: 2, name: 'Amit Patel', score: 1720, avatar: '👨' },
    { rank: 3, name: 'Neha Singh', score: 1580, avatar: '👩' },
    { rank: 4, name: 'Rahul Kumar (You)', score: unifiedScore, avatar: '🧑', isUser: true },
    { rank: 5, name: 'Vikram Mehta', score: 1290, avatar: '👨' }
  ];

  const rewards = [
    { title: 'Priority Document Processing', points: 500, icon: <Star className="h-6 w-6" />, available: true },
    { title: 'Free Public Transport Pass', points: 800, icon: <Gift className="h-6 w-6" />, available: true },
    { title: 'Subsidized Solar Installation', points: 1200, icon: <Zap className="h-6 w-6" />, available: false },
    { title: 'Community Recognition Badge', points: 1500, icon: <Trophy className="h-6 w-6" />, available: false }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Social Credit System
          </h1>
          <p className="text-muted-foreground">
            Earn rewards for eco-friendly actions and civic participation
          </p>
        </motion.div>

        {/* Unified Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-8 gradient-card border-border/50 shadow-eco">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-eco shadow-eco mb-4 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-4xl font-bold text-primary-foreground"
                >
                  {unifiedScore}
                </motion.div>
                <Trophy className="absolute -top-2 -right-2 h-8 w-8 text-sun animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Unified Credit Score</h2>
              <p className="text-muted-foreground">Eco Score + Civic Score</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <Leaf className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{user.ecoScore}</p>
                <p className="text-sm text-muted-foreground">Eco Score</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/10">
                <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{user.civicScore}</p>
                <p className="text-sm text-muted-foreground">Civic Score</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Next Milestone: {nextMilestone}</span>
                <span className="text-foreground font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {nextMilestone - unifiedScore} points to unlock premium rewards
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Others benefitted in the community
          </h2>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <Card key={index} className="p-4 gradient-card border-border/50 hover:shadow-soft transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activity.type === 'eco' ? 'bg-leaf/10 text-leaf' : 'bg-water/10 text-water'}`}>
                      {activity.icon}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    {activity.points}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Community Leaderboard
          </h2>
          <Card className="p-6 gradient-card border-border/50 shadow-soft">
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${entry.isUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${entry.rank === 1 ? 'bg-sun text-sun-foreground' :
                        entry.rank === 2 ? 'bg-muted text-foreground' :
                          entry.rank === 3 ? 'bg-earth text-earth-foreground' :
                            'bg-muted text-foreground'
                      }`}>
                      {entry.rank}
                    </div>
                    <span className="text-2xl">{entry.avatar}</span>
                    <div>
                      <p className={`font-medium ${entry.isUser ? 'text-primary' : 'text-foreground'}`}>
                        {entry.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{entry.score} points</p>
                    </div>
                  </div>
                  {entry.rank <= 3 && <Trophy className="h-5 w-5 text-sun" />}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Available Rewards
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {rewards.map((reward, index) => (
              <Card key={index} className={`p-5 gradient-card border-border/50 ${reward.available ? 'hover:shadow-eco' : 'opacity-60'} transition-all`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg ${reward.available ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {reward.icon}
                  </div>
                  <Badge variant={reward.available ? 'default' : 'secondary'}>
                    {reward.points} pts
                  </Badge>
                </div>
                <h4 className="font-semibold text-foreground mb-2">{reward.title}</h4>
                <Button
                  className={reward.available ? 'w-full gradient-eco shadow-eco' : 'w-full'}
                  variant={reward.available ? 'default' : 'outline'}
                  disabled={!reward.available}
                >
                  {reward.available ? 'Redeem Now' : 'Locked'}
                </Button>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SocialCredit;
