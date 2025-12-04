import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { 
  Leaf, 
  Recycle, 
  Award, 
  TrendingUp, 
  Users, 
  Globe,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const features = [
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "Carbon Tracking",
      description: "Track and reduce your carbon footprint with AI-powered insights and explainable recommendations.",
      color: "text-leaf"
    },
    {
      icon: <Recycle className="h-8 w-8" />,
      title: "Waste Management",
      description: "Real-time waste monitoring with quantum-optimized routing for efficient resource collection.",
      color: "text-water"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Social Credit System",
      description: "Earn rewards for eco-friendly actions and civic participation. Redeem for priority services.",
      color: "text-sun"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Agentic AI",
      description: "Autonomous civic intelligence that automates sustainability actions and optimizes resources.",
      color: "text-primary"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Engagement",
      description: "Connect with neighbors, compete on leaderboards, and drive collective sustainability.",
      color: "text-secondary"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Multilingual Support",
      description: "Available in English, Hindi, and regional languages for inclusive civic participation.",
      color: "text-earth"
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Citizens" },
    { value: "50T", label: "CO₂ Reduced" },
    { value: "95%", label: "Response Rate" },
    { value: "24/7", label: "AI Monitoring" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powered by Agentic AI</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground">
              Sustainable Communities
              <span className="block mt-2 bg-gradient-eco bg-clip-text text-transparent">
                Start Here
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Vasundhara 2.0 brings AI-powered sustainability intelligence to every citizen. 
              Track carbon, manage waste, and earn rewards for building a greener future.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link to="/auth">
                <Button size="lg" className="gradient-eco shadow-eco gap-2 text-lg px-8">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Complete Sustainability Platform
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for sustainable civic living in one place
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 gradient-card border-border/50 hover:shadow-eco transition-all duration-300 h-full">
                  <div className={`${feature.color} mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 text-center gradient-card border-primary/20 shadow-eco">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Leaf className="h-16 w-16 text-primary mx-auto mb-6 animate-float" />
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of citizens building sustainable communities with AI
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-foreground">Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-foreground">Instant rewards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-foreground">Real impact</span>
                </div>
              </div>

              <Link to="/auth">
                <Button size="lg" className="gradient-eco shadow-eco gap-2 text-lg px-8">
                  Join Vasundhara 2.0
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 Vasundhara 2.0 - Agentic Civic OS for Sustainable Communities</p>
          <p className="text-sm mt-2">Built with AI for a greener tomorrow</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
