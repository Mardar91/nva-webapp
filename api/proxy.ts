import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const targetUrl = req.query.url as string;

  if (!targetUrl) {
    return res.status(400).send('Missing target URL');
  }

  try {
    const response = await axios.get(targetUrl, {
        responseType: 'text'
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html');
    res.status(response.status).send(response.data);
  } catch (error: any) {
    console.error('Proxy error:', error);
      res.status(500).send({ message: 'Proxy error', error: error.message });
  }
}
