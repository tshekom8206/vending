import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { usersAPI, estatesAPI, purchasesAPI, incidentsAPI } from '../services/api';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    change: number;
  };
  estates: {
    total: number;
    occupancy: number;
    change: number;
  };
  purchases: {
    total: number;
    revenue: number;
    change: number;
  };
  incidents: {
    total: number;
    resolved: number;
    critical: number;
  };
}

interface RecentActivity {
  type: 'purchase' | 'incident' | 'user';
  id: string;
  title: string;
  subtitle: string;
  time: string;
  status?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, active: 0, change: 0 },
    estates: { total: 0, occupancy: 0, change: 0 },
    purchases: { total: 0, revenue: 0, change: 0 },
    incidents: { total: 0, resolved: 0, critical: 0 }
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersRes, estatesRes, purchasesRes, incidentsRes] = await Promise.all([
        usersAPI.getUserStats(),
        estatesAPI.getEstates({ limit: 1 }),
        purchasesAPI.getPurchaseStatistics(),
        incidentsAPI.getIncidentStats()
      ]);

      setStats({
        users: {
          total: usersRes.data?.summary?.totalUsers || 0,
          active: usersRes.data?.summary?.activeUsers || 0,
          change: 5.2 // Mock data
        },
        estates: {
          total: estatesRes.pagination?.total || 0,
          occupancy: 85, // Mock data
          change: 2.1
        },
        purchases: {
          total: purchasesRes.data?.summary?.totalPurchases || 0,
          revenue: purchasesRes.data?.summary?.totalAmount || 0,
          change: 12.3
        },
        incidents: {
          total: incidentsRes.data?.statusCounts?.reduce((sum: number, item: any) => sum + item.count, 0) || 0,
          resolved: incidentsRes.data?.statusCounts?.find((item: any) => item.status === 'Resolved')?.count || 0,
          critical: 3 // Mock data
        }
      });

      // Mock recent activity
      setRecentActivity([
        {
          type: 'purchase',
          id: '1',
          title: 'New electricity purchase',
          subtitle: 'John Doe purchased R150 for Unit A101',
          time: '2 minutes ago',
          status: 'success'
        },
        {
          type: 'incident',
          id: '2',
          title: 'Support ticket created',
          subtitle: 'Token delivery issue reported',
          time: '15 minutes ago',
          status: 'pending'
        },
        {
          type: 'user',
          id: '3',
          title: 'New user registration',
          subtitle: 'Sarah Wilson joined Waterfall Estate',
          time: '1 hour ago',
          status: 'info'
        }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    change,
    changeType = 'positive',
    icon: Icon,
    subtitle
  }: {
    title: string;
    value: string | number;
    change?: number;
    changeType?: 'positive' | 'negative';
    icon: React.ComponentType<any>;
    subtitle?: string;
  }) => (
    <div className=\"bg-white overflow-hidden shadow rounded-lg\">
      <div className=\"p-5\">
        <div className=\"flex items-center\">
          <div className=\"flex-shrink-0\">
            <Icon className=\"h-6 w-6 text-gray-400\" />
          </div>
          <div className=\"ml-5 w-0 flex-1\">
            <dl>
              <dt className=\"text-sm font-medium text-gray-500 truncate\">{title}</dt>
              <dd>
                <div className=\"text-lg font-medium text-gray-900\">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {(change !== undefined || subtitle) && (
        <div className=\"bg-gray-50 px-5 py-3\">
          <div className=\"text-sm\">
            {change !== undefined ? (
              <div className=\"flex items-center\">
                {changeType === 'positive' ? (
                  <ArrowUpIcon className=\"h-4 w-4 text-green-500\" />
                ) : (
                  <ArrowDownIcon className=\"h-4 w-4 text-red-500\" />
                )}
                <span className={`ml-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {change}%
                </span>
                <span className=\"ml-1 text-gray-500\">from last month</span>
              </div>
            ) : (
              <span className=\"text-gray-500\">{subtitle}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className=\"min-h-screen flex items-center justify-center\">
        <div className=\"animate-spin rounded-full h-32 w-32 border-b-2 border-pacific-blue\"></div>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      <div>
        <h1 className=\"text-2xl font-bold text-gray-900\">Dashboard</h1>
        <p className=\"mt-1 text-sm text-gray-500\">
          Welcome back! Here's what's happening with your electricity vending system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className=\"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4\">
        <StatCard
          title=\"Total Users\"
          value={stats.users.total}
          change={stats.users.change}
          icon={UsersIcon}
          subtitle={`${stats.users.active} active users`}
        />
        <StatCard
          title=\"Estates\"
          value={stats.estates.total}
          change={stats.estates.change}
          icon={BuildingOfficeIcon}
          subtitle={`${stats.estates.occupancy}% occupancy rate`}
        />
        <StatCard
          title=\"Monthly Revenue\"
          value={`R${stats.purchases.revenue.toLocaleString()}`}
          change={stats.purchases.change}
          icon={CurrencyDollarIcon}
          subtitle={`${stats.purchases.total} purchases`}
        />
        <StatCard
          title=\"Open Incidents\"
          value={stats.incidents.total - stats.incidents.resolved}
          icon={ExclamationTriangleIcon}
          subtitle={`${stats.incidents.critical} critical`}
        />
      </div>

      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
        {/* Recent Activity */}
        <div className=\"bg-white shadow rounded-lg\">
          <div className=\"px-4 py-5 sm:p-6\">
            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Recent Activity</h3>
            <div className=\"flow-root\">
              <ul className=\"-mb-8\">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className=\"relative pb-8\">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span
                          className=\"absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200\"
                          aria-hidden=\"true\"
                        />
                      ) : null}
                      <div className=\"relative flex space-x-3\">
                        <div>
                          <span className=\"h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-pacific-blue\">
                            <ChartBarIcon className=\"h-5 w-5 text-white\" />
                          </span>
                        </div>
                        <div className=\"min-w-0 flex-1 pt-1.5 flex justify-between space-x-4\">
                          <div>
                            <p className=\"text-sm text-gray-900\">{activity.title}</p>
                            <p className=\"text-sm text-gray-500\">{activity.subtitle}</p>
                          </div>
                          <div className=\"text-right text-sm whitespace-nowrap text-gray-500\">
                            <time>{activity.time}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className=\"bg-white shadow rounded-lg\">
          <div className=\"px-4 py-5 sm:p-6\">
            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Quick Actions</h3>
            <div className=\"grid grid-cols-2 gap-4\">
              <button className=\"relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pacific-blue\">
                <BuildingOfficeIcon className=\"h-5 w-5 mr-2 text-gray-400\" />
                Add Estate
              </button>
              <button className=\"relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pacific-blue\">
                <UsersIcon className=\"h-5 w-5 mr-2 text-gray-400\" />
                Add User
              </button>
              <button className=\"relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pacific-blue\">
                <BellIcon className=\"h-5 w-5 mr-2 text-gray-400\" />
                Send Alert
              </button>
              <button className=\"relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pacific-blue\">
                <ChartBarIcon className=\"h-5 w-5 mr-2 text-gray-400\" />
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className=\"bg-white shadow rounded-lg\">
        <div className=\"px-4 py-5 sm:p-6\">
          <h3 className=\"text-lg font-medium text-gray-900 mb-4\">System Status</h3>
          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
            <div className=\"flex items-center\">
              <div className=\"h-4 w-4 bg-green-400 rounded-full mr-3\"></div>
              <div>
                <p className=\"text-sm font-medium text-gray-900\">API Status</p>
                <p className=\"text-sm text-gray-500\">All systems operational</p>
              </div>
            </div>
            <div className=\"flex items-center\">
              <div className=\"h-4 w-4 bg-green-400 rounded-full mr-3\"></div>
              <div>
                <p className=\"text-sm font-medium text-gray-900\">Payment Gateway</p>
                <p className=\"text-sm text-gray-500\">Connected</p>
              </div>
            </div>
            <div className=\"flex items-center\">
              <div className=\"h-4 w-4 bg-green-400 rounded-full mr-3\"></div>
              <div>
                <p className=\"text-sm font-medium text-gray-900\">SMS Service</p>
                <p className=\"text-sm text-gray-500\">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}