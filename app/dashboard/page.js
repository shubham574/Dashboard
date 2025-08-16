'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, FileText, User, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalMeetings: 0,
    todayAttendance: 0,
    totalForms: 0,
    isCurrentlyActive: false,
    totalHours: 0,
    totalDays: 0,
    averageHours: 0
  });

  useEffect(() => {
    if (user) {
      // Create user in MongoDB on first login
      createUserIfNotExists();
      // Fetch dashboard stats
      fetchDashboardStats();
    }
  }, [user]);

  const createUserIfNotExists = async () => {
    try {
      await fetch('/api/user/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.primaryEmailAddress?.emailAddress,
          profile_pic: user.profileImageUrl,
        }),
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const quickActions = [
    {
      title: 'Meetings',
      description: 'Join scheduled meetings and track attendance',
      icon: Calendar,
      href: '/meetings',
      color: 'bg-blue-500',
      stat: `${stats.totalMeetings} meetings`
    },
    {
      title: 'Forms',
      description: 'Access and fill required forms',
      icon: FileText,
      href: '/forms',
      color: 'bg-green-500',
      stat: `${stats.totalForms} forms`
    },
    {
      title: 'Profile',
      description: 'View your profile and attendance history',
      icon: User,
      href: '/profile',
      color: 'bg-purple-500',
      stat: 'View details'
    },
    {
      title: 'Attendance',
      description: 'Track your work hours and attendance',
      icon: Clock,
      href: '/profile#attendance',
      color: stats.isCurrentlyActive ? 'bg-green-500' : 'bg-orange-500',
      stat: stats.isCurrentlyActive ? 'Active' : `${stats.todayAttendance}h today`
    },
    {
      title: 'Statistics',
      description: 'View your overall work statistics',
      icon: User,
      href: '/profile',
      color: 'bg-indigo-500',
      stat: `${stats.totalHours}h total`
    }
  ];

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your work today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`${action.color} rounded-lg p-3 mr-4`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {action.description}
                      </p>
                      <p className="text-xs text-blue-600 font-medium mt-2">
                        {action.stat}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Employee Stats Section */}
      <EmployeeStatsSection />
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Logged in at 9:00 AM today</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Joined team meeting at 10:30 AM</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Completed weekly report form</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// New Employee Stats Section Component
function EmployeeStatsSection() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeStats();
  }, []);

  const fetchEmployeeStats = async () => {
    try {
      const response = await fetch('/api/employees/active-stats');
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employee stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Team Members Currently Active</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Team Members Currently Active</h2>
        <p className="text-gray-500">No team members are currently signed in.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Team Members Currently Active</h2>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {employees.length} Active
          </span>
        </div>
        
        <div className="space-y-4">
          {employees.map((employee) => (
            <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <img
                  src={employee.profilePic || '/default-avatar.png'}
                  alt={employee.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-500">{employee.email}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {employee.totalMonthlyHours}h this month
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Team Hours This Month:</span>
            <span className="font-medium">
              {employees.reduce((sum, emp) => sum + emp.totalMonthlyHours, 0).toFixed(1)}h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
