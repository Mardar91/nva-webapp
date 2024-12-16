import { VercelRequest, VercelResponse } from '@vercel/node';
import axios, { AxiosRequestConfig } from 'axios';

// Cookie store
let cookieStore = '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const targetUrl = req.query.url as string;
  
  if (!targetUrl) {
    return res.status(400).send('Missing target URL');
  }

  try {
    // Configurazione della richiesta
    const config: AxiosRequestConfig = {
      responseType: 'text',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      withCredentials: true
    };

    // Se abbiamo cookie salvati, li includiamo nella richiesta
    if (cookieStore) {
      config.headers = {
        ...config.headers,
        'Cookie': cookieStore
      };
    }

    const response = await axios.get(targetUrl, config);

    // Salviamo i cookie ricevuti
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      cookieStore = cookies.join('; ');
    }

    // Impostiamo gli header della risposta
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'text/html');

    res.status(response.status).send(response.data);
  } catch (error: any) {
    console.error('Proxy error:', error);
    res.status(500).send({ 
      message: 'Proxy error', 
      error: error.message,
      details: error.response?.data
    });
  }
}
