class IncidentModel {
  String id;
  String incidentNumber;
  String name;
  String phone;
  String meterNumber;
  String issueType;
  String category;
  String? subcategory;
  String urgency;
  String priority;
  String subject;
  String description;
  DateTime reportedDate;
  DateTime createdAt;
  DateTime? updatedAt;
  String status;
  String? responseMessage;

  // Reporter information
  String? reporterName;
  String? reporterEmail;
  String? reporterPhone;

  // Unit and estate information
  String? unitId;
  String? unitNumber;
  String? estateName;
  String? meterId;

  // Assignment and resolution
  String? assignedTo;
  String? assignedTeam;
  DateTime? assignedAt;
  String? resolvedBy;
  DateTime? resolvedAt;
  String? resolutionSummary;

  IncidentModel({
    required this.id,
    required this.incidentNumber,
    required this.name,
    required this.phone,
    this.meterNumber = '',
    required this.issueType,
    required this.category,
    this.subcategory,
    required this.urgency,
    required this.priority,
    required this.subject,
    required this.description,
    required this.reportedDate,
    required this.createdAt,
    this.updatedAt,
    required this.status,
    this.responseMessage,
    this.reporterName,
    this.reporterEmail,
    this.reporterPhone,
    this.unitId,
    this.unitNumber,
    this.estateName,
    this.meterId,
    this.assignedTo,
    this.assignedTeam,
    this.assignedAt,
    this.resolvedBy,
    this.resolvedAt,
    this.resolutionSummary,
  });

  factory IncidentModel.fromJson(Map<String, dynamic> json) {
    return IncidentModel(
      id: json['_id'] ?? json['id'] ?? '',
      incidentNumber: json['incidentNumber'] ?? '',
      name: json['reporter']?['name'] ?? '',
      phone: json['reporter']?['phone'] ?? '',
      meterNumber: json['meter']?['meterNumber'] ?? '',
      issueType: json['category'] ?? '',
      category: json['category'] ?? '',
      subcategory: json['subcategory'],
      urgency: json['priority'] ?? 'Medium',
      priority: json['priority'] ?? 'Medium',
      subject: json['subject'] ?? '',
      description: json['description'] ?? '',
      reportedDate: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : null,
      status: json['status'] ?? 'Open',
      responseMessage: json['responseMessage'],
      reporterName: json['reporter']?['name'],
      reporterEmail: json['reporter']?['email'],
      reporterPhone: json['reporter']?['phone'],
      unitId: json['unit']?['_id'] ?? json['unit'],
      unitNumber: json['unit']?['unitNumber'],
      estateName: json['unit']?['estate']?['name'],
      meterId: json['meter']?['_id'] ?? json['meter'],
      assignedTo: json['assignedTo']?['user']?['firstName'] != null
          ? '${json['assignedTo']['user']['firstName']} ${json['assignedTo']['user']['lastName']}'
          : null,
      assignedTeam: json['assignedTo']?['team'],
      assignedAt: json['assignedTo']?['assignedAt'] != null
          ? DateTime.parse(json['assignedTo']['assignedAt'])
          : null,
      resolvedBy: json['resolution']?['resolvedBy']?['firstName'] != null
          ? '${json['resolution']['resolvedBy']['firstName']} ${json['resolution']['resolvedBy']['lastName']}'
          : null,
      resolvedAt: json['resolution']?['resolvedAt'] != null
          ? DateTime.parse(json['resolution']['resolvedAt'])
          : null,
      resolutionSummary: json['resolution']?['summary'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'incidentNumber': incidentNumber,
      'category': category,
      'subcategory': subcategory,
      'priority': priority,
      'subject': subject,
      'description': description,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'reporter': {
        'name': reporterName ?? name,
        'email': reporterEmail,
        'phone': reporterPhone ?? phone,
      },
      'unit': unitId,
      'meter': meterId,
    };
  }

  // Helper methods
  String get formattedDate {
    return '${createdAt.day}/${createdAt.month}/${createdAt.year}';
  }

  String get formattedTime {
    return '${createdAt.hour.toString().padLeft(2, '0')}:${createdAt.minute.toString().padLeft(2, '0')}';
  }

  String get statusColor {
    switch (status.toLowerCase()) {
      case 'open':
      case 'new':
        return '#FF9800';
      case 'in_progress':
      case 'assigned':
        return '#2196F3';
      case 'resolved':
        return '#4CAF50';
      case 'closed':
        return '#9E9E9E';
      default:
        return '#FF9800';
    }
  }

  String get priorityColor {
    switch (priority.toLowerCase()) {
      case 'low':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'high':
        return '#FF5722';
      case 'critical':
        return '#F44336';
      default:
        return '#FF9800';
    }
  }

  bool get isResolved {
    return status.toLowerCase() == 'resolved' || status.toLowerCase() == 'closed';
  }

  bool get isOpen {
    return status.toLowerCase() == 'open' || status.toLowerCase() == 'new';
  }
}