import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { estatesAPI } from '../services/api';
import { Estate, CreateEstateForm } from '../types';
import { toast } from 'react-toastify';

interface EstateFormProps {
  isOpen: boolean;
  onClose: () => void;
  estate?: Estate | null;
  onSuccess: () => void;
}

const EstateForm: React.FC<EstateFormProps> = ({ isOpen, onClose, estate, onSuccess }) => {
  const [formData, setFormData] = useState<CreateEstateForm>({
    name: '',
    description: '',
    type: 'Residential',
    address: {
      street: '',
      suburb: '',
      city: '',
      province: 'Gauteng',
      postalCode: ''
    },
    tariff: {
      rate: 0,
      currency: 'ZAR',
      unit: 'kWh'
    },
    management: {
      company: '',
      contactPerson: '',
      phone: '',
      email: ''
    },
    amenities: []
  });

  const [loading, setLoading] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');

  const availableAmenities = [
    'Swimming Pool', 'Gym', 'Security', '24/7 Security', 'Clubhouse', 'Gardens',
    'Parking', 'Covered Parking', 'Playground', 'Tennis Court', 'CCTV',
    'Access Control', 'Elevator', 'Backup Power', 'Fiber Ready', 'Pet Friendly'
  ];

  const provinces = [
    'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State',
    'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'
  ];

  const estateTypes = ['Residential', 'Student Housing', 'Mixed Use'];

  // Initialize form data when editing
  useEffect(() => {
    if (estate) {
      setFormData({
        name: estate.name,
        description: estate.description || '',
        type: estate.type,
        address: {
          street: estate.address.street,
          suburb: estate.address.suburb || '',
          city: estate.address.city,
          province: estate.address.province,
          postalCode: estate.address.postalCode || ''
        },
        tariff: {
          rate: estate.tariff.rate,
          currency: estate.tariff.currency,
          unit: estate.tariff.unit
        },
        management: estate.management || {
          company: '',
          contactPerson: '',
          phone: '',
          email: ''
        },
        amenities: estate.amenities || []
      });
    } else {
      // Reset form for new estate
      setFormData({
        name: '',
        description: '',
        type: 'Residential',
        address: {
          street: '',
          suburb: '',
          city: '',
          province: 'Gauteng',
          postalCode: ''
        },
        tariff: {
          rate: 0,
          currency: 'ZAR',
          unit: 'kWh'
        },
        management: {
          company: '',
          contactPerson: '',
          phone: '',
          email: ''
        },
        amenities: []
      });
    }
  }, [estate, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const addAvailableAmenity = (amenity: string) => {
    if (!formData.amenities.includes(amenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (estate) {
        response = await estatesAPI.updateEstate(estate._id, formData);
      } else {
        response = await estatesAPI.createEstate(formData);
      }

      if (response.success) {
        toast.success(estate ? 'Estate updated successfully' : 'Estate created successfully');
        onSuccess();
        onClose();
      } else {
        toast.error('Failed to save estate');
      }
    } catch (error: any) {
      toast.error(error.error || 'Failed to save estate');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {estate ? 'Edit Estate' : 'Create New Estate'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estate Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estate Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {estateTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Address Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suburb
                </label>
                <input
                  type="text"
                  value={formData.address.suburb}
                  onChange={(e) => handleInputChange('address.suburb', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province *
                </label>
                <select
                  value={formData.address.province}
                  onChange={(e) => handleInputChange('address.province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.address.postalCode}
                  onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tariff Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Tariff Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tariff.rate}
                  onChange={(e) => handleInputChange('tariff.rate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.tariff.currency}
                  onChange={(e) => handleInputChange('tariff.currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ZAR">ZAR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={formData.tariff.unit}
                  onChange={(e) => handleInputChange('tariff.unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="kWh">kWh</option>
                  <option value="kW">kW</option>
                </select>
              </div>
            </div>
          </div>

          {/* Management Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Management Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Management Company
                </label>
                <input
                  type="text"
                  value={formData.management?.company || ''}
                  onChange={(e) => handleInputChange('management.company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.management?.contactPerson || ''}
                  onChange={(e) => handleInputChange('management.contactPerson', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.management?.phone || ''}
                  onChange={(e) => handleInputChange('management.phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.management?.email || ''}
                  onChange={(e) => handleInputChange('management.email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Amenities</h4>

            {/* Quick Add Buttons */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {availableAmenities.map(amenity => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => addAvailableAmenity(amenity)}
                    disabled={formData.amenities.includes(amenity)}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      formData.amenities.includes(amenity)
                        ? 'bg-gray-100 text-gray-400 border-gray-200'
                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amenity Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                placeholder="Add custom amenity..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              />
              <button
                type="button"
                onClick={addAmenity}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {/* Selected Amenities */}
            {formData.amenities.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Selected amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map(amenity => (
                    <span
                      key={amenity}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                estate ? 'Update Estate' : 'Create Estate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EstateForm;