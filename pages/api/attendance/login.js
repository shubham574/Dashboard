export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { meeting_id } = req.body;
    
    // Mock response for now
    res.status(200).json({
      success: true,
      attendance: {
        meeting_id,
        login_time: new Date().toISOString(),
        user_id: 'mock-user-id'
      }
    });
  } catch (error) {
    console.error('Error logging attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
