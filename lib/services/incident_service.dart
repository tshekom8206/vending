import 'package:get/get.dart';
import '../model/incident_model.dart';
import 'api_service.dart';

class IncidentService extends GetxService {
  final ApiService _apiService = ApiService();

  final RxList<IncidentModel> incidents = <IncidentModel>[].obs;
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchIncidents();
  }

  Future<void> fetchIncidents({
    int page = 1,
    int limit = 20,
    String? status,
    String? priority,
    String? category,
  }) async {
    try {
      isLoading.value = true;
      print('🔥 INCIDENT SERVICE: Fetching incidents...');

      Map<String, dynamic> queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
      };

      if (status != null) queryParams['status'] = status;
      if (priority != null) queryParams['priority'] = priority;
      if (category != null) queryParams['category'] = category;

      final response = await _apiService.get<dynamic>(
        '/incidents',
        queryParameters: queryParams,
      );

      if (response.success && response.data != null) {
        print('🔥 INCIDENT SERVICE: API response success');
        print('🔥 INCIDENT SERVICE: Response data type: ${response.data.runtimeType}');
        print('🔥 INCIDENT SERVICE: Response data: ${response.data}');

        // Handle the response data directly
        final List<dynamic> incidentData;
        if (response.data is Map<String, dynamic>) {
          final responseData = response.data as Map<String, dynamic>;
          incidentData = responseData['data'] as List<dynamic>;
        } else if (response.data is List<dynamic>) {
          incidentData = response.data as List<dynamic>;
        } else {
          throw Exception('Unexpected response data type: ${response.data.runtimeType}');
        }

        final List<IncidentModel> parsedIncidents = incidentData.map((json) {
          return IncidentModel.fromJson(json as Map<String, dynamic>);
        }).toList();

        incidents.value = parsedIncidents;
        print('🔥 INCIDENT SERVICE: Successfully loaded ${incidents.length} incidents');
      } else {
        print('🔥 INCIDENT SERVICE: Failed - error: ${response.error}');
        Get.snackbar('Error', 'Failed to load incidents: ${response.error}');
      }
    } catch (e) {
      print('🔥 INCIDENT SERVICE ERROR: $e');
      Get.snackbar('Error', 'Failed to load incidents: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<IncidentModel?> createIncident({
    required String category,
    String? subcategory,
    required String priority,
    required String subject,
    required String description,
    String? unitId,
    String? meterId,
    String? purchaseId,
  }) async {
    try {
      isLoading.value = true;
      print('🔥 INCIDENT SERVICE: Creating incident...');

      final Map<String, dynamic> requestData = {
        'category': category,
        'priority': priority,
        'subject': subject,
        'description': description,
      };

      if (subcategory != null) requestData['subcategory'] = subcategory;
      if (unitId != null) requestData['unit'] = unitId;
      if (meterId != null) requestData['meter'] = meterId;
      if (purchaseId != null) requestData['purchase'] = purchaseId;

      print('🔥 INCIDENT SERVICE: Request data: $requestData');

      final response = await _apiService.post<dynamic>(
        '/incidents',
        data: requestData,
      );

      if (response.success && response.data != null) {
        print('🔥 INCIDENT SERVICE: Incident created successfully');
        print('🔥 INCIDENT SERVICE: Create response data type: ${response.data.runtimeType}');
        print('🔥 INCIDENT SERVICE: Create response data: ${response.data}');

        // Handle the response data - backend returns incident object directly for creation
        final Map<String, dynamic> incidentData;
        if (response.data is Map<String, dynamic>) {
          final responseData = response.data as Map<String, dynamic>;
          // Check if it's wrapped in a 'data' field or direct incident object
          if (responseData.containsKey('data')) {
            incidentData = responseData['data'] as Map<String, dynamic>;
          } else {
            // Direct incident object (what we're actually getting)
            incidentData = responseData;
          }
        } else {
          throw Exception('Unexpected create response data type: ${response.data.runtimeType}');
        }

        final IncidentModel newIncident = IncidentModel.fromJson(incidentData);

        // Add to the beginning of the list
        incidents.insert(0, newIncident);

        Get.snackbar(
          'Success',
          'Incident reported successfully. Reference: ${newIncident.incidentNumber}',
          duration: Duration(seconds: 5),
        );

        return newIncident;
      } else {
        print('🔥 INCIDENT SERVICE: Create failed - error: ${response.error}');
        Get.snackbar('Error', 'Failed to create incident: ${response.error}');
        return null;
      }
    } catch (e) {
      print('🔥 INCIDENT SERVICE CREATE ERROR: $e');
      Get.snackbar('Error', 'Failed to create incident: $e');
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  Future<IncidentModel?> getIncident(String incidentId) async {
    try {
      print('🔥 INCIDENT SERVICE: Fetching incident details for $incidentId');

      final response = await _apiService.get<dynamic>(
        '/incidents/$incidentId',
      );

      if (response.success && response.data != null) {
        print('🔥 INCIDENT SERVICE: Incident details fetched successfully');
        final responseData = response.data as Map<String, dynamic>;
        return IncidentModel.fromJson(responseData['data']);
      } else {
        print('🔥 INCIDENT SERVICE: Get incident failed - error: ${response.error}');
        Get.snackbar('Error', 'Failed to load incident details: ${response.error}');
        return null;
      }
    } catch (e) {
      print('🔥 INCIDENT SERVICE GET ERROR: $e');
      Get.snackbar('Error', 'Failed to load incident details: $e');
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> getIncidentCategories() async {
    try {
      print('🔥 INCIDENT SERVICE: Fetching incident categories...');

      final response = await _apiService.get<dynamic>(
        '/incidents/categories',
      );

      if (response.success && response.data != null) {
        print('🔥 INCIDENT SERVICE: Categories fetched successfully');
        final responseData = response.data as Map<String, dynamic>;
        return List<Map<String, dynamic>>.from(responseData['data']);
      } else {
        print('🔥 INCIDENT SERVICE: Get categories failed - error: ${response.error}');
        // Return default categories if API fails
        return _getDefaultCategories();
      }
    } catch (e) {
      print('🔥 INCIDENT SERVICE GET CATEGORIES ERROR: $e');
      return _getDefaultCategories();
    }
  }

  List<Map<String, dynamic>> _getDefaultCategories() {
    return [
      {
        'name': 'Token Problem',
        'subcategories': ['Token not received', 'Token rejected by meter', 'Invalid token']
      },
      {
        'name': 'Meter Issue',
        'subcategories': ['Meter not working', 'Meter reading incorrect', 'Meter damaged']
      },
      {
        'name': 'Payment Issue',
        'subcategories': ['Payment failed', 'Double charged', 'Refund request']
      },
      {
        'name': 'App/System Error',
        'subcategories': ['App crashes', 'Login issues', 'Feature not working']
      },
      {
        'name': 'Billing Inquiry',
        'subcategories': ['Incorrect billing', 'Tariff inquiry', 'Usage dispute']
      },
      {
        'name': 'Connection Problem',
        'subcategories': ['No electricity', 'Partial power', 'Power fluctuation']
      },
      {
        'name': 'General Support',
        'subcategories': ['Other']
      }
    ];
  }

  // Get incidents for current user
  Future<void> refreshIncidents() async {
    await fetchIncidents();
  }

  // Filter incidents by status
  List<IncidentModel> getIncidentsByStatus(String status) {
    return incidents.where((incident) => incident.status.toLowerCase() == status.toLowerCase()).toList();
  }

  // Get incident count by status
  int getIncidentCount({String? status}) {
    if (status == null) return incidents.length;
    return getIncidentsByStatus(status).length;
  }
}