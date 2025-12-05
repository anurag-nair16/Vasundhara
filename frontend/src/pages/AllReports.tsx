import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import apiClient from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Zap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const AllReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/auth/reports/');
      setReports(res.data.reports || []);
    } catch (e) {
      console.error('Failed to fetch reports', e);
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const r of reports) {
      const key = r.category || 'uncategorized';
      if (!map[key]) map[key] = [];
      map[key].push(r);
    }
    return map;
  }, [reports]);

  const categoryLabel = (k: string) => {
    if (k === 'uncategorized') return 'Uncategorized';
    return k.charAt(0).toUpperCase() + k.slice(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">All Reported Issues</h1>
          <p className="text-sm text-muted-foreground">Grouped by category — see full details for each report.</p>
        </motion.div>

        {loading && (
          <Card className="p-6 mb-4">
            <p className="text-muted-foreground">Loading reports...</p>
          </Card>
        )}

        {!loading && Object.keys(grouped).length === 0 && (
          <Card className="p-6">No reports yet.</Card>
        )}

        <div className="space-y-6">
          {Object.keys(grouped).map((cat) => (
            <section key={cat}>
              <h2 className="text-xl font-semibold text-foreground mb-3">{categoryLabel(cat)} <span className="text-sm text-muted-foreground">({grouped[cat].length})</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grouped[cat].map((r: any) => (
                  <Card key={r.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 min-w-0">
                        <div className="p-2 rounded bg-primary/10 text-primary">
                          <Trash2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          {/* <h3 className="font-semibold text-foreground truncate">{r.issue_type || 'Issue'}</h3> */}
                          <p className="text-sm text-muted-foreground truncate">{r.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{r.location || 'Location not provided'}</p>
                          <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          {r.category ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                              <Zap className="h-3 w-3" /> {r.category}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Uncategorized</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Severity:</span>
                          <Badge className={`${r.severity === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                              r.severity === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'
                            }`} variant="outline">
                            <AlertCircle className="h-3 w-3" /> {r.severity || 'N/A'}
                          </Badge>
                        </div>

                        {r.response_time && (
                          <div className="text-xs text-muted-foreground">Response: {r.response_time}</div>
                        )}

                        <div className="mt-2">
                          <Badge variant={r.status === 'resolved' ? 'default' : r.status === 'in-progress' ? 'secondary' : 'outline'}>
                            {r.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllReports;
