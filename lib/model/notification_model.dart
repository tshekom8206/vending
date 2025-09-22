class NotificationModel {
  String id;
  String title;
  String message;
  String type; // "low_balance", "system", "purchase", "promotion"
  DateTime timestamp;
  bool isRead;
  String? complexName;
  String? unitNumber;
  double? currentBalance;
  String? actionButton; // "Buy Now", "View Details", etc.
  String? priority;
  String? category;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.timestamp,
    required this.isRead,
    this.complexName,
    this.unitNumber,
    this.currentBalance,
    this.actionButton,
    this.priority,
    this.category,
  });

  // Legacy constructor for backward compatibility
  NotificationModel.legacy(
      this.id,
      this.title,
      this.message,
      this.type,
      this.timestamp,
      this.isRead,
      this.complexName,
      this.unitNumber,
      this.currentBalance,
      this.actionButton) : priority = null, category = null;

  factory NotificationModel.fromApi(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? json['body'] ?? '',
      type: json['type'] ?? 'system',
      timestamp: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      isRead: json['channels']?['inApp']?['read'] ?? false,
      complexName: json['recipient']?['unit']?['estate']?['name'],
      unitNumber: json['recipient']?['unit']?['unitNumber'],
      currentBalance: json['data']?['currentBalance']?.toDouble(),
      actionButton: json['data']?['actionButton'],
      priority: json['priority'],
      category: json['category'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'type': type,
      'timestamp': timestamp.toIso8601String(),
      'isRead': isRead,
      'complexName': complexName,
      'unitNumber': unitNumber,
      'currentBalance': currentBalance,
      'actionButton': actionButton,
      'priority': priority,
      'category': category,
    };
  }

  NotificationModel copyWith({
    String? id,
    String? title,
    String? message,
    String? type,
    DateTime? timestamp,
    bool? isRead,
    String? complexName,
    String? unitNumber,
    double? currentBalance,
    String? actionButton,
    String? priority,
    String? category,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      type: type ?? this.type,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      complexName: complexName ?? this.complexName,
      unitNumber: unitNumber ?? this.unitNumber,
      currentBalance: currentBalance ?? this.currentBalance,
      actionButton: actionButton ?? this.actionButton,
      priority: priority ?? this.priority,
      category: category ?? this.category,
    );
  }

  // Helper methods
  String get formattedTime {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  bool get isUrgent {
    return priority?.toLowerCase() == 'high' || priority?.toLowerCase() == 'urgent';
  }
}