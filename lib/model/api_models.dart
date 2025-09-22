// User Models
class User {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String? idNumber;
  final String role;
  final bool isActive;
  final bool isVerified;
  final Address? address;
  final DateTime? lastLogin;
  final DateTime createdAt;

  User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    this.idNumber,
    required this.role,
    required this.isActive,
    required this.isVerified,
    this.address,
    this.lastLogin,
    required this.createdAt,
  });

  String get fullName => '$firstName $lastName';

  factory User.fromJson(Map<String, dynamic> json) {
    try {
      print('👤 User.fromJson: Parsing user data...');
      print('👤 User.fromJson: Input keys: ${json.keys}');

      // Safe string extraction
      String safeString(dynamic value, [String defaultValue = '']) {
        if (value == null) return defaultValue;
        if (value is String) return value;
        return value.toString();
      }

      // Safe boolean extraction
      bool safeBool(dynamic value, [bool defaultValue = false]) {
        if (value == null) return defaultValue;
        if (value is bool) return value;
        if (value is String) {
          final lowerValue = value.toLowerCase();
          return lowerValue == 'true' || lowerValue == '1';
        }
        if (value is num) return value != 0;
        return defaultValue;
      }

      // Safe DateTime parsing
      DateTime? safeDateTime(dynamic value) {
        if (value == null) return null;
        try {
          if (value is String) {
            return DateTime.parse(value);
          } else if (value is Map<String, dynamic> && value['\$date'] != null) {
            // Handle MongoDB date format
            return DateTime.parse(value['\$date']);
          } else if (value is num) {
            // Handle timestamp in milliseconds
            return DateTime.fromMillisecondsSinceEpoch(value.toInt());
          }
        } catch (e) {
          print('⚠️ User.fromJson: Invalid date format for value: $value - $e');
        }
        return null;
      }

      // Safe DateTime parsing with fallback
      DateTime safeDateTimeRequired(dynamic value, DateTime fallback) {
        final result = safeDateTime(value);
        return result ?? fallback;
      }

      // Safe Address parsing
      Address? safeAddress(dynamic value) {
        if (value == null) return null;
        try {
          if (value is Map<String, dynamic>) {
            return Address.fromJson(value);
          }
        } catch (e) {
          print('⚠️ User.fromJson: Invalid address format: $value - $e');
        }
        return null;
      }

      // Extract ID with multiple fallbacks
      String extractId() {
        final id = json['id'] ?? json['_id'];
        if (id != null) {
          return safeString(id);
        }
        print('⚠️ User.fromJson: No valid ID found in user data');
        return '';
      }

      final user = User(
        id: extractId(),
        firstName: safeString(json['firstName']),
        lastName: safeString(json['lastName']),
        email: safeString(json['email']),
        phone: safeString(json['phone']),
        idNumber: json['idNumber'] != null ? safeString(json['idNumber']) : null,
        role: safeString(json['role'], 'tenant'),
        isActive: safeBool(json['isActive'], true),
        isVerified: safeBool(json['isVerified'], false),
        address: safeAddress(json['address']),
        lastLogin: safeDateTime(json['lastLogin']),
        createdAt: safeDateTimeRequired(json['createdAt'], DateTime.now()),
      );

      print('✅ User.fromJson: Successfully parsed user: ${user.fullName} (${user.id})');
      return user;

    } catch (e, stackTrace) {
      print('❌ User.fromJson: Critical error parsing user data: $e');
      print('❌ User.fromJson: Stack trace: $stackTrace');
      print('❌ User.fromJson: Input data: $json');

      // Return a minimal valid user object to prevent crashes
      return User(
        id: '',
        firstName: 'Unknown',
        lastName: 'User',
        email: '',
        phone: '',
        role: 'tenant',
        isActive: false,
        isVerified: false,
        createdAt: DateTime.now(),
      );
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
      'idNumber': idNumber,
      'role': role,
      'isActive': isActive,
      'isVerified': isVerified,
      'address': address?.toJson(),
      'lastLogin': lastLogin?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class Address {
  final String? street;
  final String? suburb;
  final String? city;
  final String? province;
  final String? postalCode;
  final String? country;

  Address({
    this.street,
    this.suburb,
    this.city,
    this.province,
    this.postalCode,
    this.country,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    try {
      // Safe string extraction for address fields
      String? safeOptionalString(dynamic value) {
        if (value == null) return null;
        if (value is String && value.isNotEmpty) return value;
        return null;
      }

      return Address(
        street: safeOptionalString(json['street']),
        suburb: safeOptionalString(json['suburb']),
        city: safeOptionalString(json['city']),
        province: safeOptionalString(json['province']),
        postalCode: safeOptionalString(json['postalCode']),
        country: safeOptionalString(json['country']),
      );
    } catch (e) {
      print('⚠️ Address.fromJson: Error parsing address: $e');
      return Address();
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'street': street,
      'suburb': suburb,
      'city': city,
      'province': province,
      'postalCode': postalCode,
      'country': country,
    };
  }
}

// Estate Models
class Estate {
  final String id;
  final String name;
  final String? description;
  final String type;
  final Address address;
  final Coordinates? coordinates;
  final Tariff tariff;
  final Management? management;
  final List<String> amenities;
  final List<EstateImage> images;
  final int totalUnits;
  final int occupiedUnits;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  Estate({
    required this.id,
    required this.name,
    this.description,
    required this.type,
    required this.address,
    this.coordinates,
    required this.tariff,
    this.management,
    required this.amenities,
    required this.images,
    required this.totalUnits,
    required this.occupiedUnits,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  double get occupancyRate => totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
  String get primaryImageUrl => images.isNotEmpty ? images.first.url : '';
  String get formattedTariff => 'R${tariff.rate.toStringAsFixed(2)}/${tariff.unit}';
  int get availableUnits => totalUnits - occupiedUnits;

  factory Estate.fromJson(Map<String, dynamic> json) {
    // Parse images
    List<EstateImage> parseImages(dynamic value) {
      if (value == null || value is! List) return [];
      return (value as List).map((imageJson) {
        if (imageJson is Map<String, dynamic>) {
          return EstateImage.fromJson(imageJson);
        }
        return EstateImage(url: '', description: '', isPrimary: false);
      }).toList();
    }

    // Safe DateTime parsing
    DateTime safeDateTime(dynamic value, DateTime defaultValue) {
      if (value == null) return defaultValue;
      try {
        if (value is String) return DateTime.parse(value);
        else if (value is Map<String, dynamic> && value['\$date'] != null) {
          return DateTime.parse(value['\$date']);
        }
      } catch (e) {
        print('⚠️ Estate.fromJson: Invalid date format for value: $value - $e');
      }
      return defaultValue;
    }

    return Estate(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      type: json['type'] ?? 'Residential',
      address: Address.fromJson(json['address'] ?? {}),
      coordinates: json['coordinates'] != null ? Coordinates.fromJson(json['coordinates']) : null,
      tariff: Tariff.fromJson(json['tariff'] ?? {}),
      management: json['management'] != null ? Management.fromJson(json['management']) : null,
      amenities: List<String>.from(json['amenities'] ?? []),
      images: parseImages(json['images']),
      totalUnits: json['totalUnits'] ?? 0,
      occupiedUnits: json['occupiedUnits'] ?? 0,
      isActive: json['isActive'] ?? true,
      createdAt: safeDateTime(json['createdAt'], DateTime.now()),
      updatedAt: safeDateTime(json['updatedAt'], DateTime.now()),
    );
  }
}

class Coordinates {
  final double latitude;
  final double longitude;

  Coordinates({
    required this.latitude,
    required this.longitude,
  });

  factory Coordinates.fromJson(Map<String, dynamic> json) {
    return Coordinates(
      latitude: (json['latitude'] ?? 0).toDouble(),
      longitude: (json['longitude'] ?? 0).toDouble(),
    );
  }
}

class Tariff {
  final double rate;
  final String currency;
  final String unit;
  final DateTime? lastUpdated;

  Tariff({
    required this.rate,
    required this.currency,
    required this.unit,
    this.lastUpdated,
  });

  factory Tariff.fromJson(Map<String, dynamic> json) {
    return Tariff(
      rate: (json['rate'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'ZAR',
      unit: json['unit'] ?? 'kWh',
      lastUpdated: json['lastUpdated'] != null ? DateTime.parse(json['lastUpdated']) : null,
    );
  }

  String get formattedRate => '$currency${rate.toStringAsFixed(2)}/$unit';
}

class Management {
  final String? company;
  final String? contactPerson;
  final String? phone;
  final String? email;

  Management({
    this.company,
    this.contactPerson,
    this.phone,
    this.email,
  });

  factory Management.fromJson(Map<String, dynamic> json) {
    return Management(
      company: json['company'],
      contactPerson: json['contactPerson'],
      phone: json['phone'],
      email: json['email'],
    );
  }
}

// Unit Models
class Unit {
  final String id;
  final String unitNumber;
  final String estateId;
  final UnitSpecifications? specifications;
  final UnitCharges? charges;
  final String status;
  final User? tenant;
  final Lease? lease;
  final bool isActive;

  Unit({
    required this.id,
    required this.unitNumber,
    required this.estateId,
    this.specifications,
    this.charges,
    required this.status,
    this.tenant,
    this.lease,
    required this.isActive,
  });

  factory Unit.fromJson(Map<String, dynamic> json) {
    // Helper function to safely extract estate ID
    String extractEstateId(dynamic estateValue) {
      if (estateValue == null) return '';
      if (estateValue is String) return estateValue;
      if (estateValue is Map<String, dynamic>) {
        return estateValue['id'] ?? estateValue['_id'] ?? '';
      }
      return estateValue.toString();
    }

    return Unit(
      id: json['id'] ?? json['_id'] ?? '',
      unitNumber: json['unitNumber'] ?? '',
      estateId: extractEstateId(json['estate'] ?? json['estateId']),
      specifications: json['specifications'] != null
          ? UnitSpecifications.fromJson(json['specifications'])
          : null,
      charges: json['charges'] != null
          ? UnitCharges.fromJson(json['charges'])
          : null,
      status: json['status'] ?? 'Available',
      tenant: json['tenant'] != null && json['tenant'] is Map<String, dynamic> ? User.fromJson(json['tenant']) : null,
      lease: json['lease'] != null && json['lease'] is Map<String, dynamic> ? Lease.fromJson(json['lease']) : null,
      isActive: json['isActive'] ?? true,
    );
  }
}

class UnitSpecifications {
  final int bedrooms;
  final int bathrooms;
  final Area? area;
  final int? floor;

  UnitSpecifications({
    required this.bedrooms,
    required this.bathrooms,
    this.area,
    this.floor,
  });

  factory UnitSpecifications.fromJson(Map<String, dynamic> json) {
    return UnitSpecifications(
      bedrooms: json['bedrooms'] ?? 0,
      bathrooms: json['bathrooms'] ?? 0,
      area: json['area'] != null ? Area.fromJson(json['area']) : null,
      floor: json['floor'],
    );
  }
}

class Area {
  final double size;
  final String unit;

  Area({
    required this.size,
    required this.unit,
  });

  factory Area.fromJson(Map<String, dynamic> json) {
    return Area(
      size: (json['size'] ?? 0).toDouble(),
      unit: json['unit'] ?? 'm²',
    );
  }
}

class UnitCharges {
  final double monthlyRent;
  final double? deposit;

  UnitCharges({
    required this.monthlyRent,
    this.deposit,
  });

  factory UnitCharges.fromJson(Map<String, dynamic> json) {
    return UnitCharges(
      monthlyRent: (json['monthlyRent'] ?? 0).toDouble(),
      deposit: json['deposit']?.toDouble(),
    );
  }
}

class Lease {
  final DateTime? startDate;
  final DateTime? endDate;
  final double? monthlyRent;
  final double? deposit;
  final String status;

  Lease({
    this.startDate,
    this.endDate,
    this.monthlyRent,
    this.deposit,
    required this.status,
  });

  factory Lease.fromJson(Map<String, dynamic> json) {
    return Lease(
      startDate: json['startDate'] != null ? DateTime.parse(json['startDate']) : null,
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
      monthlyRent: json['monthlyRent']?.toDouble(),
      deposit: json['deposit']?.toDouble(),
      status: json['status'] ?? 'Pending',
    );
  }
}

// Purchase Models
class Purchase {
  final String id;
  final String? transactionId;
  final String userId;
  final String? unitId;
  final String? unitNumber;
  final String? meterId;
  final String? estateName;
  final String? estateCity;
  final PurchaseAmount amount;
  final Electricity electricity;
  final String status;
  final Payment? payment;
  final Delivery? delivery;
  final DateTime createdAt;

  Purchase({
    required this.id,
    this.transactionId,
    required this.userId,
    this.unitId,
    this.unitNumber,
    this.meterId,
    this.estateName,
    this.estateCity,
    required this.amount,
    required this.electricity,
    required this.status,
    this.payment,
    this.delivery,
    required this.createdAt,
  });

  factory Purchase.fromJson(Map<String, dynamic> json) {
    try {
      // Safe string extraction with better error handling
      String safeString(dynamic value, [String defaultValue = '']) {
        if (value == null) return defaultValue;
        if (value is String) return value;
        if (value is Map<String, dynamic>) {
          return value['_id']?.toString() ?? value['id']?.toString() ?? defaultValue;
        }
        return value.toString();
      }

      // Safe string extraction for optional values
      String? safeOptionalString(dynamic value) {
        if (value == null) return null;
        if (value is String) return value;
        if (value is Map<String, dynamic>) {
          var id = value['_id'] ?? value['id'];
          return id?.toString();
        }
        return value.toString();
      }

      // Safe number extraction
      double safeDouble(dynamic value, [double defaultValue = 0.0]) {
        if (value == null) return defaultValue;
        if (value is num) return value.toDouble();
        if (value is String) {
          try {
            return double.parse(value);
          } catch (e) {
            return defaultValue;
          }
        }
        return defaultValue;
      }

      // Extract unit number and estate info safely
      String? unitNumber;
      String? estateName;
      String? estateCity;
      if (json['unit'] is Map<String, dynamic>) {
        var unit = json['unit'] as Map<String, dynamic>;
        unitNumber = safeOptionalString(unit['unitNumber'] ?? unit['number']);

        // Extract estate information
        if (unit['estate'] is Map<String, dynamic>) {
          var estate = unit['estate'] as Map<String, dynamic>;
          estateName = safeOptionalString(estate['name']);

          // Extract city from nested address
          if (estate['address'] is Map<String, dynamic>) {
            var address = estate['address'] as Map<String, dynamic>;
            estateCity = safeOptionalString(address['city']);
          }
        }
      }

      // Extract token value safely
      String? tokenValue;
      if (json['token'] is Map<String, dynamic>) {
        var token = json['token'] as Map<String, dynamic>;
        tokenValue = safeOptionalString(token['value']);
      } else if (json['token'] is String) {
        tokenValue = json['token'] as String;
      }

      // Safe DateTime parsing
      DateTime parseDateTime(dynamic value) {
        if (value == null) return DateTime.now();
        if (value is String) {
          try {
            return DateTime.parse(value);
          } catch (e) {
            return DateTime.now();
          }
        }
        if (value is Map<String, dynamic> && value['\$date'] != null) {
          try {
            return DateTime.parse(value['\$date']);
          } catch (e) {
            return DateTime.now();
          }
        }
        return DateTime.now();
      }

      return Purchase(
        id: safeString(json['id'] ?? json['_id']),
        transactionId: safeOptionalString(json['transactionId']),
        userId: safeString(json['user']),
        unitId: safeString(json['unit']),
        unitNumber: unitNumber,
        meterId: safeString(json['meter']),
        estateName: estateName,
        estateCity: estateCity,
        amount: PurchaseAmount(
          requested: safeDouble(json['amount']),
          final_: safeDouble(json['amount']),
          currency: 'ZAR'
        ),
        electricity: Electricity(
          units: safeDouble(json['unitsReceived'] ?? json['units']),
          rate: safeDouble(json['tariffRate'] ?? json['rate']),
          token: tokenValue
        ),
        status: safeString(json['status'], 'Pending'),
        payment: json['payment'] is Map<String, dynamic>
            ? Payment.fromJson(json['payment'] as Map<String, dynamic>)
            : null,
        delivery: json['delivery'] is Map<String, dynamic>
            ? Delivery.fromJson(json['delivery'] as Map<String, dynamic>)
            : null,
        createdAt: parseDateTime(json['createdAt']),
      );
    } catch (e) {
      print('🔥 Purchase.fromJson error: $e');
      print('🔥 Purchase.fromJson json: $json');
      rethrow;
    }
  }
}

class PurchaseAmount {
  final double requested;
  final double final_;
  final String currency;

  PurchaseAmount({
    required this.requested,
    required this.final_,
    required this.currency,
  });

  factory PurchaseAmount.fromJson(Map<String, dynamic> json) {
    return PurchaseAmount(
      requested: (json['requested'] ?? 0).toDouble(),
      final_: (json['final'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'ZAR',
    );
  }
}

class Electricity {
  final double units;
  final double rate;
  final String? token;

  Electricity({
    required this.units,
    required this.rate,
    this.token,
  });

  factory Electricity.fromJson(Map<String, dynamic> json) {
    return Electricity(
      units: (json['units'] ?? 0).toDouble(),
      rate: (json['rate'] ?? 0).toDouble(),
      token: json['token'],
    );
  }
}

class Payment {
  final String method;
  final String? reference;
  final String status;

  Payment({
    required this.method,
    this.reference,
    required this.status,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      method: json['method'] ?? 'Unknown',
      reference: json['reference'],
      status: json['status'] ?? 'Pending',
    );
  }
}

class Delivery {
  final String method;
  final String status;

  Delivery({
    required this.method,
    required this.status,
  });

  factory Delivery.fromJson(Map<String, dynamic> json) {
    return Delivery(
      method: json['method'] ?? 'SMS',
      status: json['status'] ?? 'Pending',
    );
  }
}

// Authentication Models
class AuthResponse {
  final String accessToken;
  final String refreshToken;
  final User user;

  AuthResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken'] ?? '',
      refreshToken: json['refreshToken'] ?? '',
      user: User.fromJson(json['user'] ?? {}),
    );
  }
}

// Estate Image Model for the existing Estate class
class EstateImage {
  final String url;
  final String description;
  final bool isPrimary;

  EstateImage({
    required this.url,
    required this.description,
    required this.isPrimary,
  });

  String getFullUrl(String baseUrl) {
    if (url.startsWith('http')) return url;
    return '$baseUrl$url';
  }

  factory EstateImage.fromJson(Map<String, dynamic> json) {
    return EstateImage(
      url: json['url']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      isPrimary: json['isPrimary'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'url': url,
      'description': description,
      'isPrimary': isPrimary,
    };
  }
}