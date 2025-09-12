class ElectricityPurchaseModel {
  String id;
  String complexName;
  String meterNumber;
  String unitNumber;
  double amountZar;
  double kwhPurchased;
  String token;
  DateTime purchaseDate;
  String status;
  String transactionReference;

  ElectricityPurchaseModel(
      this.id,
      this.complexName,
      this.meterNumber,
      this.unitNumber,
      this.amountZar,
      this.kwhPurchased,
      this.token,
      this.purchaseDate,
      this.status,
      this.transactionReference);
}