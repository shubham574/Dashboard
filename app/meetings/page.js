'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { Calendar, Clock, ExternalLink, LogOut } from 'lucide-react';

export default function Meetings() {
  const { user } = useUser();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    fetchMeetings();
    checkActiveSession();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings');
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkActiveSession = async () => {
    try {
      const response = await fetch('/api/attendance/active');
      if (response.ok) {
        const data = await response.json();
        setActiveSession(data.activeSession);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const handleJoinMeeting = async (meeting) => {
    try {
      const response = await fetch('/api/attendance/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_id: meeting.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSession(data.attendance);
        // Redirect to meeting link
        window.open(meeting.acf.meet_link, '_blank');
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/attendance/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setActiveSession(null);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meetings</h1>
        <p className="text-gray-600">Join scheduled meetings and track your attendance.</p>
        
        {activeSession && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">Active Session</h3>
                <p className="text-sm text-green-600">
                  Started at {format(new Date(activeSession.login_time), 'h:mm a')}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {meetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings scheduled</h3>
            <p className="text-gray-600">Check back later for upcoming meetings.</p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {meeting.title.rendered}
                    </h3>
                    
                    {meeting.acf?.meeting_time && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(meeting.acf.meeting_time), 'PPP p')}
                        </span>
                      </div>
                    )}
                    
                    {meeting.content?.rendered && (
                      <div 
                        className="text-gray-700 mb-4"
                        dangerouslySetInnerHTML={{ __html: meeting.content.rendered }}
                      />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {meeting.acf?.meet_link && (
                      <button
                        onClick={() => handleJoinMeeting(meeting)}
                        disabled={!user || activeSession}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          activeSession
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-blue-600'
                        }`}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Join Meeting</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Meeting ID: {meeting.id}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
