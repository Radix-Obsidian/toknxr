import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

interface DashboardStats {
  totalCost: number;
  totalInteractions: number;
  avgCostPerTask: number;
  wasteRate: number;
  byProvider: Record<string, {
    cost: number;
    interactions: number;
    avgQuality?: number;
    avgEffectiveness?: number;
  }>;
  recentInteractions: Array<{
    timestamp: string;
    provider: string;
    model: string;
    cost: number;
    taskType?: string;
    qualityScore?: number;
    effectivenessScore?: number;
  }>;
}

const COLORS = {
  primary: '#6B5BED',
  secondary: '#9B5BED',
  accent: '#ED5B9B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  textMuted: '#94A3B8'
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  icon?: string;
  color?: string;
}> = ({ title, value, change, icon, color = COLORS.primary }) => (
  <div style={{
    background: COLORS.surface,
    borderRadius: '12px',
    padding: '24px',
    border: `1px solid ${color}20`,
    boxShadow: `0 4px 6px -1px ${color}10`
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ color: COLORS.textMuted, fontSize: '14px', margin: '0 0 8px 0' }}>
          {title}
        </p>
        <p style={{
          fontSize: '32px',
          fontWeight: 'bold',
          margin: '0',
          color: COLORS.text,
          background: `linear-gradient(135deg, ${color}, ${COLORS.secondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {value}
        </p>
        {change && (
          <p style={{
            color: change.startsWith('+') ? COLORS.error : COLORS.success,
            fontSize: '14px',
            margin: '4px 0 0 0'
          }}>
            {change}
          </p>
        )}
      </div>
      {icon && (
        <div style={{
          fontSize: '24px',
          color: color,
          opacity: 0.8
        }}>
          {icon}
        </div>
      )}
    </div>
  </div>
);

const MiniChart: React.FC<{ data: number[]; color?: string }> = ({
  data,
  color = COLORS.primary
}) => (
  <div style={{ height: '40px', display: 'flex', alignItems: 'end', gap: '2px' }}>
    {data.map((value, i) => (
      <div
        key={i}
        style={{
          width: '4px',
          height: `${Math.max(4, (value / Math.max(...data)) * 40)}px`,
          background: color,
          borderRadius: '2px',
          opacity: 0.6 + (i / data.length) * 0.4
        }}
      />
    ))}
  </div>
);

const ProviderCard: React.FC<{
  name: string;
  data: DashboardStats['byProvider'][string];
}> = ({ name, data }) => (
  <div style={{
    background: COLORS.surface,
    borderRadius: '8px',
    padding: '16px',
    border: `1px solid ${COLORS.primary}20`
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <h3 style={{ margin: 0, color: COLORS.text, fontSize: '16px' }}>{name}</h3>
      <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
        ${data.cost.toFixed(2)}
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
      <div style={{ color: COLORS.textMuted }}>
        Interactions: <span style={{ color: COLORS.text }}>{data.interactions}</span>
      </div>
      {data.avgQuality && (
        <div style={{ color: COLORS.textMuted }}>
          Quality: <span style={{ color: COLORS.accent }}>{data.avgQuality}/100</span>
        </div>
      )}
      {data.avgEffectiveness && (
        <div style={{ color: COLORS.textMuted }}>
          Effectiveness: <span style={{ color: COLORS.secondary }}>{data.avgEffectiveness}/100</span>
        </div>
      )}
    </div>
  </div>
);

const RecentActivity: React.FC<{ interactions: DashboardStats['recentInteractions'] }> = ({
  interactions
}) => (
  <div style={{
    background: COLORS.surface,
    borderRadius: '12px',
    padding: '24px',
    border: `1px solid ${COLORS.primary}20`
  }}>
    <h2 style={{ margin: '0 0 16px 0', color: COLORS.text }}>Recent Activity</h2>
    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
      {interactions.slice(0, 10).map((interaction, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: i < interactions.length - 1 ? `1px solid ${COLORS.primary}10` : 'none'
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ color: COLORS.text, fontSize: '14px', fontWeight: '500' }}>
              {interaction.provider} • {interaction.model}
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: '12px' }}>
              {new Date(interaction.timestamp).toLocaleTimeString()}
              {interaction.taskType && ` • ${interaction.taskType}`}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: COLORS.success, fontSize: '14px', fontWeight: '500' }}>
              ${interaction.cost.toFixed(4)}
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
              {interaction.qualityScore && (
                <span style={{ color: COLORS.accent }}>
                  Q:{interaction.qualityScore}
                </span>
              )}
              {interaction.effectivenessScore && (
                <span style={{ color: COLORS.secondary }}>
                  E:{interaction.effectivenessScore}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();

      // Transform the data for the dashboard
      const transformedStats: DashboardStats = {
        totalCost: data.totals.total || 0,
        totalInteractions: data.totals.requestCount || 0,
        avgCostPerTask: data.totals.requestCount ? (data.totals.total / data.totals.requestCount) : 0,
        wasteRate: 0, // TODO: Calculate based on quality scores
        byProvider: {},
        recentInteractions: []
      };

      // Transform provider data
      if (data.totals.byProvider) {
        Object.entries(data.totals.byProvider).forEach(([provider, providerData]: [string, any]) => {
          transformedStats.byProvider[provider] = {
            cost: providerData.costUSD || 0,
            interactions: providerData.requestCount || 0,
            avgQuality: providerData.avgQualityScore,
            avgEffectiveness: providerData.avgEffectivenessScore
          };
        });
      }

      setStats(transformedStats);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{
        background: COLORS.background,
        minHeight: '100vh',
        color: COLORS.text,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${COLORS.primary}30`,
              borderTop: `3px solid ${COLORS.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p>Loading dashboard...</p>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: COLORS.background,
        minHeight: '100vh',
        color: COLORS.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px'
      }}>
        <div style={{
          background: COLORS.error,
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          Error: {error}
        </div>
        <button
          onClick={fetchStats}
          style={{
            background: COLORS.primary,
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{
      background: COLORS.background,
      minHeight: '100vh',
      color: COLORS.text,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.primary}20`,
        padding: '16px 24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '24px'
            }}>
              🚀 TokNXR Dashboard
            </h1>
            <p style={{ color: COLORS.textMuted, margin: '4px 0 0 0', fontSize: '14px' }}>
              Real-time AI Effectiveness & Code Quality Analytics
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: COLORS.textMuted, fontSize: '12px' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={fetchStats}
              style={{
                background: COLORS.primary,
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginTop: '4px'
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="Total Cost"
            value={`$${stats.totalCost.toFixed(4)}`}
            icon="💰"
            color={COLORS.success}
          />
          <StatCard
            title="Total Interactions"
            value={stats.totalInteractions}
            icon="📊"
            color={COLORS.primary}
          />
          <StatCard
            title="Avg Cost per Task"
            value={`$${stats.avgCostPerTask.toFixed(4)}`}
            icon="🎯"
            color={COLORS.secondary}
          />
          <StatCard
            title="Waste Rate"
            value={`${stats.wasteRate.toFixed(1)}%`}
            icon="⚠️"
            color={stats.wasteRate > 20 ? COLORS.error : COLORS.warning}
          />
        </div>

        {/* Provider Breakdown */}
        {Object.keys(stats.byProvider).length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: COLORS.text, margin: '0 0 16px 0' }}>
              Provider Breakdown
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {Object.entries(stats.byProvider).map(([name, data]) => (
                <ProviderCard key={name} name={name} data={data} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px'
        }}>
          <RecentActivity interactions={stats.recentInteractions} />
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: COLORS.surface,
        borderTop: `1px solid ${COLORS.primary}20`,
        padding: '16px 24px',
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: '12px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          TokNXR Dashboard • Real-time AI Analytics • {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

// Mount the dashboard
const container = document.getElementById('dashboard-root');
if (container) {
  const root = createRoot(container);
  root.render(<Dashboard />);
}
