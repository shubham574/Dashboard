# TeamBoard - Employee Attendance & Meeting Tracking System

A comprehensive employee management system that tracks attendance, meeting participation, and working hours using Next.js, Clerk authentication, and MongoDB.

## Features

### 🕒 **Attendance Tracking**
- **Login/Logout System**: Employees can log in and out of work sessions
- **Automatic Time Calculation**: System automatically calculates working hours
- **Daily Attendance Records**: Track attendance for each day
- **Active Session Management**: Prevent multiple active sessions per day

### 📅 **Meeting Management**
- **Meeting Integration**: Connect with WordPress for meeting schedules
- **Meeting Attendance**: Track which meetings employees join
- **Meeting Links**: Direct access to meeting URLs
- **Attendance Correlation**: Link attendance records to specific meetings

### 📊 **Statistics & Analytics**
- **Daily Hours**: Track hours worked each day
- **Total Hours**: Cumulative working hours
- **Average Hours**: Average daily working hours
- **Attendance History**: Complete attendance records
- **Meeting Participation**: Track meeting attendance

### 👤 **User Management**
- **Clerk Authentication**: Secure user authentication
- **Profile Management**: User profiles with attendance history
- **Dashboard**: Overview of work statistics
- **Real-time Status**: Active session indicators

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  auth_id: String,        // Clerk user ID
  created_at: Date,
  updated_at: Date
}
```

### Attendance Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,      // Reference to user
  meeting_id: String,     // Meeting ID from WordPress
  date: Date,             // Attendance date
  login_time: Date,       // Login timestamp
  logout_time: Date,      // Logout timestamp (null if active)
  worked_hours: Number,   // Calculated working hours
  created_at: Date,
  updated_at: Date
}
```

## API Endpoints

### Attendance Management
- `POST /api/attendance/login` - Start attendance session
- `POST /api/attendance/logout` - End attendance session
- `GET /api/attendance/active` - Check active session

### User Data
- `GET /api/user/attendance/history` - Get attendance history
- `POST /api/user/create` - Create user record

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### External Data
- `GET /api/meetings` - Get meetings from WordPress
- `GET /api/forms` - Get forms from WordPress

## Workflow

### 1. **Employee Login Process**
1. Employee signs in with Clerk authentication
2. Employee clicks "Join Meeting" for a scheduled meeting
3. System creates attendance record with login timestamp
4. Employee is redirected to meeting link
5. System tracks active session

### 2. **Employee Logout Process**
1. Employee clicks "Logout" button
2. System calculates working hours (logout time - login time)
3. System updates attendance record with logout timestamp
4. Employee receives confirmation with worked hours

### 3. **Attendance Tracking**
- System prevents multiple active sessions per day
- Working hours are automatically calculated
- Attendance history is maintained for reporting
- Statistics are updated in real-time

## Environment Variables

Create a `.env.local` file with:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# WordPress API
WORDPRESS_API_URL=your_wordpress_api_url
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd teamboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## Usage

### For Employees
1. **Sign In**: Use Clerk authentication to sign in
2. **Join Meetings**: Click "Join Meeting" to start attendance tracking
3. **Participate**: Attend meetings via provided links
4. **Logout**: Click "Logout" to end your work session
5. **View History**: Check your attendance history in the profile section

### For Administrators
1. **Monitor Dashboard**: View overall attendance statistics
2. **Review Reports**: Access detailed attendance reports
3. **Manage Meetings**: Update meeting schedules in WordPress
4. **Track Performance**: Monitor employee attendance patterns

## Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Authentication**: Clerk
- **Database**: MongoDB
- **External APIs**: WordPress REST API
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
