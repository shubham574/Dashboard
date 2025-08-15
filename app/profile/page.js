'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { User, Clock, Calendar } from 'lucide-react';
import Image from 'next/image';

export default function Profile() {
  const { user } = useUser();
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    totalDays: 0,
    averageHours: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAttendanceHistory();
    }
  }, [user]);

  const fetchAttendanceHistory = async () => {
    try {
      const response = await fetch('/api/user/attendance/history');
      const data = await response.json();
      setAttendanceHistory(data.attendance);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Image
              src={user.profileImageUrl}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
            <p className="text-sm text-gray-500">
              Joined: {format(new Date(user.createdAt), 'PPP')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Days Worked</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDays}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Average Hours/Day</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageHours}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div id="attendance" className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Attendance History</h2>
          
          {attendanceHistory.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No attendance records</h3>
              <p className="text-gray-600">Your attendance history will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Login Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Logout Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours Worked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meeting
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceHistory.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.login_time ? format(new Date(record.login_time), 'h:mm a') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.logout_time ? format(new Date(record.logout_time), 'h:mm a') : 'Active'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.worked_hours ? `${record.worked_hours}h` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Meeting #{record.meeting_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
