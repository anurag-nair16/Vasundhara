import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CarbonTracking from "./pages/CarbonTracking";
import WasteManagement from "./pages/WasteManagement";
import AllReports from "./pages/AllReports";
import SocialCredit from "./pages/SocialCredit";
import Profile from "./pages/Profile";
import RouteOptimization from "./pages/RouteOptimization";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/carbon" element={<ProtectedRoute><CarbonTracking /></ProtectedRoute>} />
                <Route path="/waste" element={<ProtectedRoute><WasteManagement /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><AllReports /></ProtectedRoute>} />
                <Route path="/credits" element={<ProtectedRoute><SocialCredit /></ProtectedRoute>} />
                <Route path="/route" element={<ProtectedRoute><RouteOptimization /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;



