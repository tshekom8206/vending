class UserModel {
  String id;
  String name;
  String email;
  String phone;
  String selectedComplexId;
  String selectedComplexName;
  String unitNumber;
  String meterNumber;
  String profileImage;
  bool isVerified;

  UserModel(
      this.id,
      this.name,
      this.email,
      this.phone,
      this.selectedComplexId,
      this.selectedComplexName,
      this.unitNumber,
      this.meterNumber,
      this.profileImage,
      this.isVerified);
}