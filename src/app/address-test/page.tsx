// Address Management Test Component
import React, { useState, useEffect } from 'react';

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export default function AddressTest() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testAddress = {
    name: "John Doe",
    phone: "01712345678", 
    street: "123 Test Street",
    city: "Dhaka",
    state: "Dhaka",
    postalCode: "1000",
    country: "Bangladesh"
  };

  const testAddAddress = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testAddress)
      });
      
      const result = await response.json();
      console.log('Add Address Response:', result);
      
      if (response.ok) {
        setAddresses(prev => [result, ...prev]);
        alert('Address added successfully!');
      } else {
        setError(`Failed to add address: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error adding address:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/addresses');
      const result = await response.json();
      console.log('Load Addresses Response:', result);
      
      if (response.ok) {
        setAddresses(Array.isArray(result) ? result : []);
      } else {
        setError(`Failed to load addresses: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/addresses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });
      
      const result = await response.json();
      console.log('Delete Address Response:', result);
      
      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        alert('Address deleted successfully!');
      } else {
        setError(`Failed to delete address: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Address Management Test</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={loadAddresses}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load Addresses'}
        </button>
        
        <button
          onClick={testAddAddress}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ml-2"
        >
          {loading ? 'Adding...' : 'Add Test Address'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Addresses ({addresses.length})</h2>
        {addresses.length === 0 ? (
          <p className="text-gray-500">No addresses found</p>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="border border-gray-200 rounded p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{address.name}</h3>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                  <p className="text-sm">{address.street}</p>
                  <p className="text-sm">{address.city}, {address.state} {address.postalCode}</p>
                  <p className="text-sm">{address.country}</p>
                  {address.isDefault && (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded mt-2">
                      Default
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteAddress(address.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
