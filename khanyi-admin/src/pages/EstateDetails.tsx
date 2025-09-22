import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  HomeIcon,
  UserIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { estatesAPI, unitsAPI } from '../services/api';
import { Estate, Unit, ApiResponse } from '../types';
import { toast } from 'react-toastify';
import EstateForm from '../components/EstateForm';

const EstateDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [estate, setEstate] = useState<Estate | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'statistics' | 'settings'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateUnitModal, setShowCreateUnitModal] = useState(false);

  // Fetch estate details
  const fetchEstateDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const [estateResponse, unitsResponse, statsResponse] = await Promise.all([
        estatesAPI.getEstate(id),
        estatesAPI.getEstateUnits(id),
        estatesAPI.getEstateStatistics(id)
      ]);

      if (estateResponse.success) {
        setEstate(estateResponse.data);
      }

      if (unitsResponse.success) {
        setUnits(unitsResponse.data);
      }

      if (statsResponse.success) {
        setStatistics(statsResponse.data);
      }
    } catch (error: any) {
      toast.error('Failed to fetch estate details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstateDetails();
  }, [id]);

  const handleUpdateSuccess = () => {
    fetchEstateDetails();
    setShowEditModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Occupied':
        return 'bg-blue-100 text-blue-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Reserved':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-600">Loading estate details...</p>
      </div>
    );
  }

  if (!estate) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Estate not found</p>
        <button
          onClick={() => navigate('/estates')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Estates
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/estates')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{estate.name}</h1>
            <p className="text-gray-600">{estate.fullAddress}</p>
          </div>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PencilIcon className="h-5 w-5" />
          <span>Edit Estate</span>
        </button>
      </div>

      {/* Estate Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <HomeIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Units</p>
              <p className="text-2xl font-bold text-gray-900">{estate.totalUnits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Occupied Units</p>
              <p className="text-2xl font-bold text-gray-900">{estate.occupiedUnits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{estate.occupancyRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CogIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tariff Rate</p>
              <p className="text-2xl font-bold text-gray-900">R{estate.tariff.rate}/kWh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'units', label: 'Units' },
            { key: 'statistics', label: 'Statistics' },
            { key: 'settings', label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Estate Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="text-sm text-gray-900">{estate.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900">{estate.description || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        estate.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {estate.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Management</h3>
                {estate.management ? (
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Company</dt>
                      <dd className="text-sm text-gray-900">{estate.management.company}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                      <dd className="text-sm text-gray-900">{estate.management.contactPerson}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900">{estate.management.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{estate.management.email}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-gray-500">No management information available</p>
                )}
              </div>
            </div>

            {/* Amenities */}
            {estate.amenities && estate.amenities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {estate.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'units' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Units ({units.length})</h3>
              <button
                onClick={() => setShowCreateUnitModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Unit</span>
              </button>
            </div>

            {units.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No units found for this estate</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map((unit) => (
                  <div key={unit._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{unit.unitNumber}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.status)}`}>
                        {unit.status}
                      </span>
                    </div>

                    {unit.tenant && (
                      <p className="text-sm text-gray-600">
                        Tenant: {unit.tenant.firstName} {unit.tenant.lastName}
                      </p>
                    )}

                    {unit.specifications && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{unit.specifications.bedrooms} bed, {unit.specifications.bathrooms} bath</p>
                        {unit.specifications.area && (
                          <p>{unit.specifications.area.size} {unit.specifications.area.unit}</p>
                        )}
                      </div>
                    )}

                    {unit.meter && (
                      <div className="mt-2 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          unit.meter.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          Meter: {unit.meter.status}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Estate Statistics</h3>
            {statistics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add statistics cards here based on the API response */}
                <div className="text-center py-12 col-span-full">
                  <p className="text-gray-500">Statistics dashboard coming soon...</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No statistics available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Estate Settings</h3>
            <div className="text-center py-12">
              <p className="text-gray-500">Settings panel coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EstateForm
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        estate={estate}
        onSuccess={handleUpdateSuccess}
      />

      {/* TODO: Create Unit Form Modal */}
      {showCreateUnitModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Add New Unit</h3>
            <p className="text-gray-600">Unit form component coming soon...</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateUnitModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstateDetails;