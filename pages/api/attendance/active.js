export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Return empty active session for now
    res.status(200).json({ activeSession: null });
  } catch (error) {
    console.error('Error fetching active session:', error);
    res.status(500).json({ message: 'Failed to fetch active session' });
  }
}
