import { useGetAnalytics } from "@workspace/api-client-react";
import { useApiAuth } from "@/lib/auth";
import { Loader2, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell
} from "recharts";

export function AnalyticsTab() {
  const authOpts = useApiAuth();
  const { data, isLoading } = useGetAnalytics(authOpts);

  if (isLoading) return <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary"/></div>;
  if (!data) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-white/10 text-sm">
          <p className="text-white/60 mb-1">{label}</p>
          <p className="font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
            {payload[0].value} {payload[0].name}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/20 text-primary rounded-xl"><Eye className="w-6 h-6"/></div>
            <h4 className="text-lg font-medium text-white/80">Total Views</h4>
          </div>
          <p className="text-5xl font-display font-bold tracking-tight">{data.totalViews}</p>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/30 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-accent/20 text-accent rounded-xl"><MousePointerClick className="w-6 h-6"/></div>
            <h4 className="text-lg font-medium text-white/80">Total Clicks</h4>
          </div>
          <p className="text-5xl font-display font-bold tracking-tight">{data.totalClicks}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-3xl">
          <h4 className="text-lg font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary"/> Views over time</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.recentViews}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Views" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl">
          <h4 className="text-lg font-bold mb-6 flex items-center gap-2"><MousePointerClick className="w-5 h-5 text-accent"/> Clicks over time</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.recentClicks}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Clicks" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Link Stats */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <h4 className="text-xl font-display font-bold mb-6">Link Performance</h4>
        {data.linkStats.length === 0 ? (
          <p className="text-white/50 py-4">Not enough data yet.</p>
        ) : (
          <div className="space-y-4">
            {data.linkStats.sort((a,b) => b.clicks - a.clicks).map((stat, i) => {
              const maxClicks = Math.max(...data.linkStats.map(s => s.clicks), 1);
              const percentage = (stat.clicks / maxClicks) * 100;
              return (
                <div key={stat.linkId} className="relative p-4 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex items-center justify-between">
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-primary/10 -z-10" 
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="font-semibold text-white truncate pr-4">{stat.title}</span>
                  <div className="flex items-center gap-2 font-mono bg-white/10 px-3 py-1 rounded-lg">
                    <span className="text-primary font-bold">{stat.clicks}</span>
                    <span className="text-white/50 text-sm">clicks</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </motion.div>
  );
}
