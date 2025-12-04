import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  trend?: number;
  icon: React.ReactNode;
  color?: string;
  description?: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ 
  title, 
  score, 
  maxScore = 1000, 
  trend,
  icon,
  color = 'primary',
  description
}) => {
  const percentage = (score / maxScore) * 100;
  const isPositiveTrend = trend && trend > 0;

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    warning: 'text-warning',
    leaf: 'text-leaf',
    water: 'text-water',
    sun: 'text-sun'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 gradient-card border-border/50 shadow-soft hover:shadow-eco transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <motion.h3 
                className="text-3xl font-bold text-foreground"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {score}
              </motion.h3>
              <span className="text-sm text-muted-foreground">/ {maxScore}</span>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}/10 ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
        </div>

        <Progress value={percentage} className="h-2 mb-3" />

        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs">
            {isPositiveTrend ? (
              <>
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success font-medium">+{trend}</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-destructive" />
                <span className="text-destructive font-medium">{trend}</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ScoreCard;
