import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../config/constants';

interface MarketplaceStats {
  totalNftsMinted: number;
  totalNftsListed: number;
  totalSales: number;
  totalVolume: number;
}

export function Stats() {
  const [stats, setStats] = useState<MarketplaceStats>({
    totalNftsMinted: 0,
    totalNftsListed: 0,
    totalSales: 0,
    totalVolume: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stats loading">Loading stats...</div>;
  }

  return (
    <div className="stats">
      <div className="stat-card">
        <div className="stat-icon">🎨</div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalNftsMinted}</div>
          <div className="stat-label">Total Minted</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🏷️</div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalNftsListed}</div>
          <div className="stat-label">Currently Listed</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalSales}</div>
          <div className="stat-label">Total Sales</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <div className="stat-value">{(stats.totalVolume / 1e9).toFixed(2)} SUI</div>
          <div className="stat-label">Total Volume</div>
        </div>
      </div>
    </div>
  );
}
