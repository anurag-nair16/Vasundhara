import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingDown,
  Lightbulb,
  Car,
  Home,
  ShoppingBag,
  Zap,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const CarbonTracking = () => {
  const monthlyData = [
    { month: 'Jan', emissions: 420 },
    { month: 'Feb', emissions: 380 },
    { month: 'Mar', emissions: 350 },
    { month: 'Apr', emissions: 320 },
    { month: 'May', emissions: 290 },
    { month: 'Jun', emissions: 270 }
  ];

  const categoryData = [
    { name: 'Transportation', value: 40, color: '#3b82f6' },
    { name: 'Electricity', value: 30, color: '#10b981' },
    { name: 'Food', value: 20, color: '#f59e0b' },
    { name: 'Shopping', value: 10, color: '#ef4444' }
  ];

  const recommendations = [
    {
      icon: <Car className="h-5 w-5" />,
      title: 'Use Public Transport',
      description: 'Switch to metro/bus 3 days a week',
      impact: '-15 kg CO₂/month',
      color: 'text-blue-500'
    },
    {
      icon: <Home className="h-5 w-5" />,
      title: 'Solar Energy',
      description: 'Install rooftop solar panels',
      impact: '-80 kg CO₂/month',
      color: 'text-amber-500'
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      title: 'Local Products',
      description: 'Buy locally sourced goods',
      impact: '-10 kg CO₂/month',
      color: 'text-green-500'
    }
  ];

  const currentEmissions = 270;
  const targetEmissions = 200;
  const progress = ((targetEmissions / currentEmissions) * 100);

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
            Carbon Footprint Tracking
          </h1>
          <p className="text-muted-foreground">
            Track, understand, and reduce your environmental impact with AI-powered insights
          </p>
        </motion.div>

        {/* Current Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 gradient-card border-border/50 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">Current Emissions</h3>
                <TrendingDown className="h-6 w-6 text-success" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-foreground">{currentEmissions}</span>
                <span className="text-2xl text-muted-foreground">kg CO₂</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">This month</p>
              <div className="flex items-center gap-2 text-sm text-success">
                <TrendingDown className="h-4 w-4" />
                <span>12% decrease from last month</span>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 gradient-card border-border/50 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">Target Progress</h3>
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Target: {targetEmissions} kg</span>
                  <span className="text-foreground font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
              <p className="text-sm text-muted-foreground">
                You're on track to meet your sustainability goals!
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 gradient-card border-border/50 shadow-soft">
              <h3 className="text-xl font-semibold text-foreground mb-4">Monthly Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar dataKey="emissions" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 gradient-card border-border/50 shadow-soft">
              <h3 className="text-xl font-semibold text-foreground mb-4">Emission Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">AI-Powered Recommendations</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className="p-5 gradient-card border-border/50 hover:shadow-eco transition-all duration-300">
                <div className={`${rec.color} mb-3`}>
                  {rec.icon}
                </div>
                <h4 className="font-semibold text-foreground mb-2">{rec.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-success font-medium">{rec.impact}</span>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Info className="h-3 w-3" />
                    Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Explainability Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="p-6 gradient-card border-primary/20 shadow-eco">
            <h3 className="text-xl font-semibold text-foreground mb-4">Understanding Your Footprint</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Transportation Impact (40%)</p>
                  <p className="text-sm text-muted-foreground">Your daily commute contributes significantly. Consider carpooling or public transport.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Electricity Usage (30%)</p>
                  <p className="text-sm text-muted-foreground">Peak hours consumption is high. Solar panels could reduce this by 80%.</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CarbonTracking;
