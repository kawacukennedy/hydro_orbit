import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Input } from '@hydro-orbit/ui';
import { useFarmsStore } from '../stores/farmsStore';

export default function CreateFarmPage() {
  const navigate = useNavigate();
  const { createFarm, isLoading } = useFarmsStore();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createFarm({
        name,
        location,
        area: parseFloat(area),
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create farm');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent>
          <h2 className="text-2xl font-bold mb-6">Create New Farm</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Farm Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Farm"
              required
            />
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              required
            />
            <Input
              label="Area (hectares)"
              type="number"
              step="0.1"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="10.5"
              required
            />
            <Button type="submit" className="w-full" loading={isLoading}>
              Create Farm
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
