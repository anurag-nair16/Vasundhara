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
  Info,
  Zap,
  Upload, Camera, CheckCircle2, Leaf, Bus, Sun, X, Recycle, CloudRain, Trash2, Image as ImageIcon
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


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

  const earningOptions = [
    {
      id: 'solar',
      title: 'Install Solar Panels',
      description: 'Generate clean energy and reduce reliance on the grid.',
      reward: '500 Credits',
      icon: <Sun className="h-6 w-6 text-orange-500" />,
      color: 'bg-orange-500/10 text-orange-500',
      requirements: ['Photo of installation', 'Utility bill or Receipt with your name']
    },
    {
      id: 'transport',
      title: 'Use Public Transport',
      description: 'Take the bus or metro to reduce daily emissions.',
      reward: '50 Credits/week',
      icon: <Bus className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-500/10 text-blue-500',
      requirements: ['Photo of ticket/pass', 'Selfie inside the vehicle']
    },
    {
      id: 'plant',
      title: 'Plant a Tree',
      description: 'Increase green cover and absorb CO₂.',
      reward: '100 Credits',
      icon: <Leaf className="h-6 w-6 text-green-500" />,
      color: 'bg-green-500/10 text-green-500',
      requirements: ['Photo of planted sapling', 'GPS Location screenshot']
    },
    {
      id: 'compost',
      title: 'Home Composting',
      description: 'Recycle organic waste into nutrient-rich soil.',
      reward: '200 Credits',
      icon: <Recycle className="h-6 w-6 text-earth" />,
      color: 'bg-earth/10 text-earth',
      requirements: ['Photo of compost bin', 'Usage log']
    },
    {
      id: 'water',
      title: 'Rainwater Harvesting',
      description: 'Collect and store rainwater for reuse.',
      reward: '300 Credits',
      icon: <CloudRain className="h-6 w-6 text-water" />,
      color: 'bg-water/10 text-water',
      requirements: ['Photo of harvesting system', 'Installation receipt']
    },
    {
      id: 'energy',
      title: 'Energy Efficiency',
      description: 'Use 5-star rated appliances to save power.',
      reward: '150 Credits',
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      color: 'bg-yellow-500/10 text-yellow-500',
      requirements: ['Photo of appliance rating label', 'Purchase receipt']
    }
  ];

  const [selectedOption, setSelectedOption] = useState<typeof earningOptions[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Cleanup preview URLs on unmount or change
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      toast.error("Some files were skipped (only images allowed)");
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      const newUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (previewUrls[index]) URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const handleSubmitProof = () => {
    if (selectedFiles.length === 0) {
      toast.error("Please upload at least one proof image");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSelectedOption(null);
      clearFiles(); // Reset file state
      toast.success("Proofs submitted successfully! Credits will be verified shortly.");
    }, 1500);
  };

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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            Carbon Footprint Tracking
          </h1>
          <p className="text-muted-foreground">
            Track, understand, and reduce your environmental impact with AI-powered insights
          </p>
        </motion.div>

        {/* Earn Carbon Credits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="h-6 w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Ways to Earn Carbon Credits</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {earningOptions.map((option) => (
              <Card key={option.id} className="p-5 gradient-card border-border/50 hover:shadow-eco transition-all duration-300 flex flex-col h-full">
                <div className={`p-3 w-fit rounded-lg ${option.color} mb-4`}>
                  {option.icon}
                </div>
                <h4 className="font-semibold text-lg text-foreground mb-2">{option.title}</h4>
                <p className="text-sm text-muted-foreground mb-4 flex-grow">{option.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-bold text-success bg-success/10 px-2 py-1 rounded-full">
                    +{option.reward}
                  </span>
                  <Button
                    size="sm"
                    className="gap-1 shadow-sm"
                    onClick={() => setSelectedOption(option)}
                  >
                    <Upload className="h-3 w-3" />
                    Submit Proof
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Dialog open={!!selectedOption} onOpenChange={(open) => {
            if (!open) {
              setSelectedOption(null);
              clearFiles();
            }
          }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Proof for {selectedOption?.title}</DialogTitle>
                <DialogDescription>
                  Upload the required documents to claim your {selectedOption?.reward}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium mb-2">Requirements:</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {selectedOption?.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="picture">Upload Proof</Label>

                  {/* Image Previews Grid */}
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative w-full h-32 rounded-lg overflow-hidden border border-border group animate-in fade-in-0 zoom-in-95 duration-300">
                          <img
                            src={url}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeFile(index)}
                              className="h-8 w-8 rounded-full shadow-md"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dropzone (Stick around to allow adding more) */}
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className={`flex flex-col items-center justify-center w-full ${previewUrls.length > 0 ? 'h-24' : 'h-40'} border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${dragActive
                          ? 'border-primary bg-primary/5 scale-[1.02]'
                          : 'border-input hover:bg-muted/50 hover:border-primary/50'
                        }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        <div className={`p-2 rounded-full mb-2 transition-colors ${dragActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {dragActive ? <Upload className="h-5 w-5 animate-bounce" /> : <ImageIcon className="h-5 w-5" />}
                        </div>
                        <p className="text-xs sm:text-sm text-foreground mb-1">
                          <span className="font-semibold text-primary">{previewUrls.length > 0 ? 'Add more images' : 'Click to upload proof'}</span> or drag and drop
                        </p>
                        {previewUrls.length === 0 && (
                          <p className="text-[10px] text-muted-foreground">
                            JPEG, PNG or WEBP (MAX. 5MB)
                          </p>
                        )}
                      </div>
                      <Input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between gap-2">
                <Button variant="outline" onClick={() => setSelectedOption(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitProof}
                  disabled={isSubmitting}
                  className="gradient-eco"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit for Verification
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">Current Emissions</h3>
                <TrendingDown className="h-6 w-6 text-success" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl sm:text-5xl font-bold text-foreground">{currentEmissions}</span>
                <span className="text-xl sm:text-2xl text-muted-foreground">kg CO₂</span>
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
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">Target Progress</h3>
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
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Monthly Trend</h3>
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
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Emission Breakdown</h3>
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



        {/* Explainability Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="p-6 gradient-card border-primary/20 shadow-eco">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Understanding Your Footprint</h3>
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
