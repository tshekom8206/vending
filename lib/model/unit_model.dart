class UnitModel {
  String unitNumber;
  String meterNumber;
  String complexId;
  String tenantName;
  String tenantPhone;
  bool isOccupied;
  double currentBalance;

  UnitModel(
      this.unitNumber,
      this.meterNumber,
      this.complexId,
      this.tenantName,
      this.tenantPhone,
      this.isOccupied,
      this.currentBalance);
}