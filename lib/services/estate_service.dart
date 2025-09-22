import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import '../model/api_models.dart';
import 'api_service.dart';

class EstateService extends GetxService {
  final ApiService _apiService = ApiService();

  final RxList<Estate> estates = <Estate>[].obs;
  final RxList<Unit> units = <Unit>[].obs;
  final RxBool isLoading = false.obs;

  Future<void> fetchEstates() async {
    await fetchEstatesRaw();
  }

  Future<void> fetchEstatesRaw() async {
    try {
      isLoading.value = true;
      print('🔥 FETCH ESTATES: Starting to fetch estates...');

      final token = await _apiService.getToken();
      if (token == null || token.isEmpty) {
        print('🔥 FETCH ESTATES ERROR: No token available');
        Get.snackbar('Error', 'Authentication required');
        return;
      }

      print('🔥 FETCH ESTATES: Making direct HTTP call to bypass typing issues');
      print('🔥 FETCH ESTATES RAW: Starting direct HTTP call');

      final response = await http.get(
        Uri.parse('http://localhost:3000/api/v1/estates'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('🌐 HTTP GET Request: http://localhost:3000/api/v1/estates');
      print('🔥 FETCH ESTATES RAW: Response status code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);
        print('🔥 FETCH ESTATES RAW: Response data type: ${jsonData.runtimeType}');
        print('🔥 FETCH ESTATES RAW: Response success: ${jsonData['success']}');

        if (jsonData['success'] == true && jsonData['data'] != null) {
          final List<dynamic> estateData = jsonData['data'] as List<dynamic>;
          print('🔥 FETCH ESTATES: Processing ${estateData.length} estates');

          estates.value = estateData.map((json) => Estate.fromJson(json)).toList();

          if (estates.isNotEmpty) {
            print('🔥 FETCH ESTATES: First estate raw data: ${estateData.first}');
            print('🔥 FETCH ESTATES: First estate parsed - Name: ${estates.first.name}, City: ${estates.first.address.city}');
          }
          print('🔥 FETCH ESTATES: Successfully loaded ${estates.length} estates');
        } else {
          print('🔥 FETCH ESTATES ERROR: API returned success=false or no data');
          Get.snackbar('Error', jsonData['error'] ?? 'Failed to load estates');
        }
      } else {
        print('🔥 FETCH ESTATES ERROR: HTTP ${response.statusCode}');
        Get.snackbar('Error', 'Failed to load estates: HTTP ${response.statusCode}');
      }
      print('🔥 FETCH ESTATES: Completed - total estates: ${estates.length}');
    } catch (e) {
      print('🔥 FETCH ESTATES ERROR: Exception occurred: $e');
      Get.snackbar('Error', 'Failed to load estates: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchUnits({String? estateId}) async {
    await fetchUnitsRaw(estateId: estateId);
  }

  Future<void> fetchUnitsRaw({String? estateId}) async {
    try {
      isLoading.value = true;
      print('🔥 FETCH UNITS: Starting to fetch units for estate: ${estateId ?? "all"}');

      final token = await _apiService.getToken();
      if (token == null || token.isEmpty) {
        print('🔥 FETCH UNITS ERROR: No token available');
        Get.snackbar('Error', 'Authentication required');
        return;
      }

      print('🔥 FETCH UNITS: Making direct HTTP call to bypass typing issues');
      print('🔥 FETCH UNITS RAW: Starting direct HTTP call');

      // Build URL with query parameters if needed
      String url = 'http://localhost:3000/api/v1/units';
      if (estateId != null && estateId.isNotEmpty) {
        url += '?estate=$estateId';
        print('🔥 FETCH UNITS: Filtering by estate ID: $estateId');
      }

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('🌐 HTTP GET Request: $url');
      print('🔥 FETCH UNITS RAW: Response status code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);
        print('🔥 FETCH UNITS RAW: Response data type: ${jsonData.runtimeType}');
        print('🔥 FETCH UNITS RAW: Response success: ${jsonData['success']}');

        if (jsonData['success'] == true && jsonData['data'] != null) {
          final List<dynamic> unitData = jsonData['data'] as List<dynamic>;
          print('🔥 FETCH UNITS: Processing ${unitData.length} units');

          // Debug first unit structure
          if (unitData.isNotEmpty) {
            print('🔥 FETCH UNITS: First unit raw data: ${unitData.first}');
          }

          // Process units with individual error handling
          List<Unit> processedUnits = [];
          for (int i = 0; i < unitData.length; i++) {
            try {
              print('🔥 FETCH UNITS: Processing unit $i...');
              Unit unit = Unit.fromJson(unitData[i]);
              processedUnits.add(unit);
              print('🔥 FETCH UNITS: Successfully processed unit $i - ${unit.unitNumber}');
            } catch (e) {
              print('🔥 FETCH UNITS ERROR: Failed to process unit $i: $e');
              print('🔥 FETCH UNITS ERROR: Unit $i data: ${unitData[i]}');
            }
          }

          units.value = processedUnits;
          print('🔥 FETCH UNITS: Successfully loaded ${units.length} out of ${unitData.length} units');
        } else {
          print('🔥 FETCH UNITS ERROR: API returned success=false or no data');
          Get.snackbar('Error', jsonData['error'] ?? 'Failed to load units');
        }
      } else {
        print('🔥 FETCH UNITS ERROR: HTTP ${response.statusCode}');
        Get.snackbar('Error', 'Failed to load units: HTTP ${response.statusCode}');
      }
      print('🔥 FETCH UNITS: Completed - total units: ${units.length}');
    } catch (e) {
      print('🔥 FETCH UNITS ERROR: Exception occurred: $e');
      Get.snackbar('Error', 'Failed to load units: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<Estate?> getEstateById(String estateId) async {
    try {
      print('🔥 GET ESTATE BY ID: Starting to fetch estate: $estateId');
      final token = await _apiService.getToken();
      if (token == null || token.isEmpty) {
        print('🔥 GET ESTATE BY ID ERROR: No token available');
        return null;
      }

      final response = await http.get(
        Uri.parse('http://localhost:3000/api/v1/estates/$estateId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('🔥 GET ESTATE BY ID: Response status code: ${response.statusCode}');
      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);
        if (jsonData['success'] == true && jsonData['data'] != null) {
          print('🔥 GET ESTATE BY ID: Successfully loaded estate');
          return Estate.fromJson(jsonData['data']);
        }
      }
      print('🔥 GET ESTATE BY ID ERROR: Failed to load estate');
      Get.snackbar('Error', 'Failed to load estate details');
      return null;
    } catch (e) {
      print('🔥 GET ESTATE BY ID ERROR: Exception occurred: $e');
      Get.snackbar('Error', 'Failed to load estate details: $e');
      return null;
    }
  }

  Future<Unit?> getUnitById(String unitId) async {
    try {
      print('🔥 GET UNIT BY ID: Starting to fetch unit: $unitId');
      final token = await _apiService.getToken();
      if (token == null || token.isEmpty) {
        print('🔥 GET UNIT BY ID ERROR: No token available');
        return null;
      }

      final response = await http.get(
        Uri.parse('http://localhost:3000/api/v1/units/$unitId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('🔥 GET UNIT BY ID: Response status code: ${response.statusCode}');
      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);
        if (jsonData['success'] == true && jsonData['data'] != null) {
          print('🔥 GET UNIT BY ID: Successfully loaded unit');
          return Unit.fromJson(jsonData['data']);
        }
      }
      print('🔥 GET UNIT BY ID ERROR: Failed to load unit');
      Get.snackbar('Error', 'Failed to load unit details');
      return null;
    } catch (e) {
      print('🔥 GET UNIT BY ID ERROR: Exception occurred: $e');
      Get.snackbar('Error', 'Failed to load unit details: $e');
      return null;
    }
  }

  List<Estate> searchEstates(String query) {
    if (query.isEmpty) return estates;

    return estates
        .where((estate) =>
            estate.name.toLowerCase().contains(query.toLowerCase()) ||
            estate.address.city?.toLowerCase().contains(query.toLowerCase()) == true ||
            estate.address.province?.toLowerCase().contains(query.toLowerCase()) == true)
        .toList();
  }

  List<Unit> getAvailableUnits(String estateId) {
    return units
        .where((unit) =>
            unit.estateId == estateId &&
            unit.status == 'Available' &&
            unit.isActive)
        .toList();
  }

  List<Unit> getUnitsByEstate(String estateId) {
    return units
        .where((unit) => unit.estateId == estateId)
        .toList();
  }

  Future<void> fetchEstatesWithUnits() async {
    try {
      isLoading.value = true;
      print('🔥 FETCH ESTATES WITH UNITS: Starting to fetch estates that have units...');

      final token = await _apiService.getToken();
      if (token == null || token.isEmpty) {
        print('🔥 FETCH ESTATES WITH UNITS ERROR: No token available');
        Get.snackbar('Error', 'Authentication required');
        return;
      }

      final response = await http.get(
        Uri.parse('http://localhost:3000/api/v1/estates?hasUnits=true'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('🌐 HTTP GET Request: http://localhost:3000/api/v1/estates?hasUnits=true');
      print('🔥 FETCH ESTATES WITH UNITS: Response status code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);
        print('🔥 FETCH ESTATES WITH UNITS: Response success: ${jsonData['success']}');

        if (jsonData['success'] == true && jsonData['data'] != null) {
          final List<dynamic> estateData = jsonData['data'] as List<dynamic>;
          print('🔥 FETCH ESTATES WITH UNITS: Processing ${estateData.length} estates');

          estates.value = estateData.map((json) => Estate.fromJson(json)).toList();
          print('🔥 FETCH ESTATES WITH UNITS: Successfully loaded ${estates.length} estates with units');
        } else {
          print('🔥 FETCH ESTATES WITH UNITS ERROR: API returned success=false or no data');
          Get.snackbar('Error', jsonData['error'] ?? 'Failed to load estates');
        }
      } else {
        print('🔥 FETCH ESTATES WITH UNITS ERROR: HTTP ${response.statusCode}');
        // If the hasUnits filter is not supported, fall back to regular fetch and filter manually
        print('🔥 FETCH ESTATES WITH UNITS: Falling back to manual filtering...');
        await fetchEstatesAndFilterByUnits();
      }
    } catch (e) {
      print('🔥 FETCH ESTATES WITH UNITS ERROR: Exception occurred: $e');
      // Fall back to manual filtering if there's an error
      await fetchEstatesAndFilterByUnits();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchEstatesAndFilterByUnits() async {
    try {
      print('🔥 FILTERING ESTATES: Fetching all estates and filtering manually...');

      // Fetch all estates first
      await fetchEstatesRaw();

      if (estates.isEmpty) {
        print('🔥 FILTERING ESTATES: No estates found');
        return;
      }

      // Now check which estates have units by querying each one
      List<Estate> estatesWithUnits = [];

      for (Estate estate in estates) {
        print('🔥 FILTERING ESTATES: Checking units for ${estate.name} (${estate.id})');

        // Fetch units for this estate
        await fetchUnitsRaw(estateId: estate.id);

        if (units.isNotEmpty) {
          print('🔥 FILTERING ESTATES: ${estate.name} has ${units.length} units - INCLUDED');
          estatesWithUnits.add(estate);
        } else {
          print('🔥 FILTERING ESTATES: ${estate.name} has no units - EXCLUDED');
        }
      }

      // Update estates list to only include those with units
      estates.value = estatesWithUnits;
      print('🔥 FILTERING ESTATES: Final result - ${estates.length} estates with units');

    } catch (e) {
      print('🔥 FILTERING ESTATES ERROR: Exception occurred: $e');
      Get.snackbar('Error', 'Failed to filter estates: $e');
    }
  }
}