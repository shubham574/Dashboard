import { getMeetings } from '../../lib/wordpress';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const meetings = await getMeetings();
    res.status(200).json({ success: true, meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch meetings' });
  }
}
