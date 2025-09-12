class IncidentModel {
  String id;
  String name;
  String phone;
  String meterNumber;
  String issueType;
  String urgency;
  String description;
  DateTime reportedDate;
  String status;
  String responseMessage;

  IncidentModel(
      this.id,
      this.name,
      this.phone,
      this.meterNumber,
      this.issueType,
      this.urgency,
      this.description,
      this.reportedDate,
      this.status,
      this.responseMessage);
}