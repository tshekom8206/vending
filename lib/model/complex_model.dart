class ComplexModel {
  String image;
  String name;
  String location;
  String city;
  String type;
  String tariffRate;
  String address;
  List<String> availableUnits;
  bool isSelected;

  ComplexModel(
      this.image,
      this.name,
      this.location,
      this.city,
      this.type,
      this.tariffRate,
      this.address,
      this.availableUnits,
      this.isSelected);
}