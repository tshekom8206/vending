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

  NotificationModel(
      this.id,
      this.title,
      this.message,
      this.type,
      this.timestamp,
      this.isRead,
      this.complexName,
      this.unitNumber,
      this.currentBalance,
      this.actionButton);
}