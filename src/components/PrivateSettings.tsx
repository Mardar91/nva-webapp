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

  const handleLogin = () => {
    if (username === 'NVA-APP' && password === 'PrivateNonnaVit91%mola') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Credenziali non valide');
    }
  };

  const handleApiCall = async (method: 'GET' | 'POST' | 'PUT') => {
    setLoading(true);
    setApiResponse(null);
    setError('');

    try {
      const response = await fetch('/api/auto-recurring-notification', {
        method: method
      });
      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      setError('Errore nella chiamata API');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button 
                onClick={() => handleApiCall('GET')}
                disabled={loading}
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
            </div>

            {loading && (
              <div className="text-center py-4">
                Caricamento in corso...
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {apiResponse && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Risposta API:</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[400px]">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivateSettings;
