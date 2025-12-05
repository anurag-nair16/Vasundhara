import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import apiClient from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Camera,
  Mic,
  Send,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader,
  Zap,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const WasteManagement = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [issueText, setIssueText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any>(null);
  const [photoData, setPhotoData] = useState<File | null>(null);

  useEffect(() => {
    fetchStats();
    fetchReports();
  }, []);

  // const fetchStats = async () => {
  //   try {
  //     const response = await apiClient.get('/auth/report-stats/');
  //     setStats(response.data);
  //   } catch (error) {
  //     console.error('Failed to fetch stats:', error);
  //   }
  //};

  const [stats, setStats] = useState({
    total_reports: 0,
    resolved: 0,
    in_progress: 0,
    pending: 0
  });

  const [isLoading, setIsLoading] = useState(true);

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


  const fetchReports = async () => {
    try {
      const response = await apiClient.get('/auth/reports/');
      setRecentReports(response.data.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const handleGetLocation = () => {
    // In a real app, this would use the Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const simulatedLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            address: `Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`
          };
          setLocationData(simulatedLocation);
          toast.info('Location attached: ' + simulatedLocation.address);
        },
        (error) => {
          console.error('Geolocation error:', error);
          const simulatedLocation = { lat: 18.5204, lon: 73.8567, address: 'Simulated Location, Pune' };
          setLocationData(simulatedLocation);
          toast.info('Location attached (simulated): ' + simulatedLocation.address);
        }
      );
    } else {
      const simulatedLocation = { lat: 18.5204, lon: 73.8567, address: 'Simulated Location, Pune' };
      setLocationData(simulatedLocation);
      toast.info('Location attached (simulated): ' + simulatedLocation.address);
    }
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      setPhotoData(file);
      toast.info('Photo attached: ' + file.name);
    }
  };

  const handleSubmitIssue = async () => {
    if (!issueText.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('description', issueText.trim());
      formData.append('issue_type', 'Waste Management Issue');
      if (locationData) {
        formData.append('location', JSON.stringify(locationData));
      }
      if (photoData) {
        // Explicitly append with filename for better backend compatibility
        formData.append('photo', photoData, photoData.name);
        console.log('Photo attached:', photoData.name, 'Size:', photoData.size, 'Type:', photoData.type);
      } else {
        console.log('No photo attached');
      }

      // Debug: Log all form data entries
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Use native fetch for FormData to ensure correct multipart encoding
      const token = localStorage.getItem('vasundhara_access_token');
      const response = await fetch('http://localhost:8000/auth/report/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - browser will set it with boundary
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('Issue reported successfully! Crew dispatched.');
        setIssueText('');
        setLocationData(null);
        setPhotoData(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchStats();
        fetchReports();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }
    } catch (error: any) {
      console.error('Failed to submit report:', error);
      toast.error(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.heic"
        style={{ display: 'none' }}
      />
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Waste & Resource Management
          </h1>
          <p className="text-muted-foreground">
            Report issues, track waste collection, and contribute to a cleaner community
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Issues Reported', value: stats.total_reports, icon: <AlertCircle className="h-5 w-5" /> },
            { label: 'Resolved', value: stats.resolved, icon: <CheckCircle className="h-5 w-5" /> },
            { label: 'In Progress', value: stats.in_progress, icon: <Clock className="h-5 w-5" /> },
            { label: 'CO₂ Saved', value: `${stats.resolved * 50}kg`, icon: <TrendingUp className="h-5 w-5" /> }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 gradient-card border-border/50 shadow-soft">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {stat.icon}
                  </div>
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Report Issue Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6 gradient-card border-border/50 shadow-eco">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-primary" />
              Report an Issue
            </h2>

            <div className="space-y-4">
              <Textarea
                placeholder="Describe the waste management issue (e.g., bin overflow, illegal dumping)..."
                className="min-h-[120px] resize-none"
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
              />

              <div className="flex flex-wrap gap-3">
                <Button
                  variant={photoData ? 'default' : 'outline'}
                  className="gap-2"
                  onClick={handleAddPhoto}
                >
                  <Camera className="h-4 w-4" />
                  {photoData ? 'Photo Attached' : 'Add Photo'}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <Mic className={`h-4 w-4 ${isRecording ? 'text-destructive animate-pulse' : ''}`} />
                  {isRecording ? 'Recording...' : 'Voice Note'}
                </Button>
                <Button
                  variant={locationData ? 'default' : 'outline'}
                  className="gap-2"
                  onClick={handleGetLocation}
                >
                  <MapPin className="h-4 w-4" />
                  {locationData ? 'Location Added' : 'Add Location'}
                </Button>
                <Button
                  className="gradient-eco shadow-eco gap-2 ml-auto"
                  onClick={handleSubmitIssue}
                  disabled={isLoading || !issueText.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6 gradient-card border-border/50 shadow-soft overflow-hidden">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Live Resource Map</h2>
            <div className="bg-muted/30 rounded-lg h-[400px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
              <div className="relative z-10 text-center">
                <MapPin className="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
                <p className="text-muted-foreground">Interactive map showing:</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Public waste bins</li>
                  <li>• Reported issues & hotspots</li>
                  <li>• Real-time crew locations</li>
                  <li>• Optimized collection routes</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-foreground mb-4">Your Recent Reports</h2>
          <div className="space-y-3">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <Card key={report.id} className="p-4 gradient-card border-border/50 hover:shadow-soft transition-all">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    {/* Left side - Issue info */}
                    <div className="flex items-start gap-3 flex-1 min-w-[200px]">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Trash2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{report.description}</h4>
                        <p className="text-sm text-muted-foreground">{report.location || 'Location not specified'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Middle - Classification Info */}
                    {report.category && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">Category:</span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <Zap className="h-3 w-3 mr-1" />
                              {report.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">Severity:</span>
                            <Badge
                              className={`${report.severity === 'high'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : report.severity === 'medium'
                                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  : 'bg-green-50 text-green-700 border-green-200'
                                }`}
                              variant="outline"
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {report.severity}
                            </Badge>
                          </div>
                          {report.response_time && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground">Response:</span>
                              <span className="text-xs text-foreground">{report.response_time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Right side - Status */}
                    <Badge
                      variant={
                        report.status === 'resolved' ? 'default' :
                          report.status === 'in-progress' ? 'secondary' :
                            report.status === 'invalid' ? 'destructive' :
                              'outline'
                      }
                      className={
                        report.status === 'resolved' ? 'bg-success text-success-foreground' :
                          report.status === 'in-progress' ? 'bg-warning text-warning-foreground' :
                            report.status === 'invalid' ? 'bg-red-500 text-white' :
                              ''
                      }
                    >
                      {report.status === 'resolved' ? <CheckCircle className="h-3 w-3 mr-1" /> :
                        report.status === 'in-progress' ? <Clock className="h-3 w-3 mr-1" /> :
                          report.status === 'invalid' ? <XCircle className="h-3 w-3 mr-1" /> :
                            <AlertCircle className="h-3 w-3 mr-1" />}
                      {report.status}
                    </Badge>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center gradient-card border-border/50">
                <p className="text-muted-foreground">No reports yet. Start by reporting your first issue!</p>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Impact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6 gradient-card border-primary/20 shadow-eco">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-success/10 text-success">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Quantum-Optimized Routing</h3>
                <p className="text-muted-foreground mb-3">
                  AI automatically optimizes waste collection routes, reducing response time by 40% and saving 50kg CO₂ per trip.
                </p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-2xl font-bold text-success">40%</span>
                    <p className="text-muted-foreground">Faster Response</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-success">50kg</span>
                    <p className="text-muted-foreground">CO₂ Saved/Trip</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-success">{stats.resolved}</span>
                    <p className="text-muted-foreground">Issues Resolved</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WasteManagement;
