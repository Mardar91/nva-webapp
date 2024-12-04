import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const PrivateSettings = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const handleLogin = () => {
    if (username === 'NVA-APP' && password === 'PrivateNonnaVit91%mola') {
      setIsAuthenticated(true);
      setError('');
      addDebugLog('Login successful');
    } else {
      setError('Credenziali non valide');
      addDebugLog('Login failed - Invalid credentials');
    }
  };

  const addDebugLog = (message: string) => {
    setDebugInfo(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const handleApiCall = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE') => {
    setLoading(true);
    setApiResponse(null);
    setError('');
    addDebugLog(`Starting ${method} request`);

    try {
      addDebugLog(`Making API call to /api/auto-recurring-notification with method ${method}`);
      const response = await fetch('/api/auto-recurring-notification', {
        method: method
      });

      const data = await response.json();
      addDebugLog(`API Response received - Status: ${response.status}`);
      addDebugLog(`Response data: ${JSON.stringify(data, null, 2)}`);
      
      setApiResponse(data);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      if (data.success) {
        addDebugLog(`Operation successful: ${data.message}`);
      } else {
        addDebugLog(`Operation failed: ${data.message}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Errore nella chiamata API: ${errorMessage}`);
      addDebugLog(`Error occurred: ${errorMessage}`);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
      addDebugLog('Request completed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Accesso Privato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Inserisci username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci password"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button 
                className="w-full" 
                onClick={handleLogin}
              >
                Accedi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Gestione Notifiche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => handleApiCall('GET')}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Verifica Notifiche
              </Button>
              <Button 
                onClick={() => handleApiCall('POST')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                Programma Nuove Notifiche
              </Button>
              <Button 
                onClick={() => handleApiCall('PUT')}
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Aggiorna Notifiche
              </Button>
              <Button 
                onClick={() => handleApiCall('DELETE')}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                Cancella Tutte le Notifiche
              </Button>
            </div>

            {loading && (
              <div className="text-center py-4">
                <p className="text-blue-600 font-semibold">Caricamento in corso...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded border border-red-300">
                <p className="font-semibold">Errore:</p>
                <p>{error}</p>
              </div>
            )}

            {apiResponse && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Risposta API:</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[400px] whitespace-pre-wrap break-words">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Log di Debug:</h3>
              <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[200px]">
                {debugInfo.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivateSettings;
