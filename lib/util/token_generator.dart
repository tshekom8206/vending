import 'dart:math';

class TokenGenerator {
  static String generateElectricityToken() {
    // Generate a 20-digit electricity token in format: 1234 5678 9012 3456 7890
    final random = Random();
    String token = '';
    
    for (int i = 0; i < 20; i++) {
      token += random.nextInt(10).toString();
      
      // Add space every 4 digits
      if ((i + 1) % 4 == 0 && i != 19) {
        token += ' ';
      }
    }
    
    return token;
  }
  
  static String generateTransactionReference() {
    // Generate transaction reference like TXN20241208001
    final timestamp = DateTime.now();
    final random = Random();
    final randomNumber = random.nextInt(999) + 1;
    
    return 'TXN${timestamp.year}${timestamp.month.toString().padLeft(2, '0')}${timestamp.day.toString().padLeft(2, '0')}${randomNumber.toString().padLeft(3, '0')}';
  }
  
  static double calculateKwhFromAmount(double amountZar, double tariffRate) {
    // Calculate kWh from ZAR amount based on tariff rate
    return double.parse((amountZar / tariffRate).toStringAsFixed(2));
  }
  
  static double calculateAmountFromKwh(double kwh, double tariffRate) {
    // Calculate ZAR amount from kWh based on tariff rate
    return double.parse((kwh * tariffRate).toStringAsFixed(2));
  }
  
  static List<double> getPresetAmounts() {
    // Preset electricity purchase amounts in ZAR
    return [50.0, 100.0, 150.0, 200.0, 300.0, 500.0];
  }
  
  static bool isLowBalance(double balance) {
    // Consider balance low if less than 20 kWh
    return balance < 20.0;
  }
  
  static String formatBalance(double balance) {
    // Format balance display
    return '${balance.toStringAsFixed(1)} kWh';
  }
  
  static String formatCurrency(double amount) {
    // Format currency display
    return 'R${amount.toStringAsFixed(2)}';
  }
}