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
    totalForms: 0
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
      color: 'bg-orange-500',
      stat: `${stats.todayAttendance}h today`
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
