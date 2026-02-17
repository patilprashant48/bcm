import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ApiService {
  static String get baseUrl => AppConfig.baseUrl;
  
  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Auth
  Future<Map<String, dynamic>> login(String mobile, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'mobile': mobile, 'password': password}),
      );
      
      print('Login response status: ${response.statusCode}');
      print('Login response body: ${response.body}');
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Login failed');
      }
    } catch (e) {
      print('Login error: $e');
      throw Exception('Login failed: $e');
    }
  }

  Future<Map<String, dynamic>> register(String name, String email, String mobile, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register-simple'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name,
          'email': email,
          'mobile': mobile,
          'password': password,
          'role': 'INVESTOR'
        }),
      );
      
      print('Register response status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Registration failed');
      }
    } catch (e) {
      throw Exception('Registration failed: $e');
    }
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/profile'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body)['user'];
    } else {
      throw Exception('Failed to get profile');
    }
  }

  // Projects
  Future<List<dynamic>> getProjects() async {
    final response = await http.get(
      Uri.parse('$baseUrl/investor/projects/live'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['projects'] ?? [];
    } else {
      throw Exception('Failed to get projects');
    }
  }

  Future<Map<String, dynamic>> getProjectDetails(int projectId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/investor/projects/$projectId'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body)['project'];
    } else {
      throw Exception('Failed to get project details');
    }
  }

  // Wallet
  Future<Map<String, dynamic>> getWallet() async {
    final response = await http.get(
      Uri.parse('$baseUrl/wallet'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to get wallet');
    }
  }

  Future<List<dynamic>> getTransactions() async {
    final response = await http.get(
      Uri.parse('$baseUrl/wallet/transactions'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body)['transactions'];
    } else {
      throw Exception('Failed to get transactions');
    }
  }

  Future<void> topUpWallet(double amount, String paymentMethod, String transactionId, String screenshotPath) async {
    final response = await http.post(
      Uri.parse('$baseUrl/wallet/topup'),
      headers: await _getHeaders(),
      body: json.encode({
        'amount': amount,
        'paymentMethod': paymentMethod, // 'BANK_TRANSFER' or 'UPI'
        'transactionId': transactionId,
        'paymentScreenshotUrl': 'https://placeholder.com/dummy-screenshot.jpg', // Mocking URL since we track local file path
      }),
    );
    
    if (response.statusCode != 200) {
      final error = json.decode(response.body);
      throw Exception(error['message'] ?? 'Failed to top up wallet');
    }
  }

  Future<Map<String, dynamic>> getPaymentDetails() async {
    final response = await http.get(
      Uri.parse('$baseUrl/wallet/payment-details'),
      headers: await _getHeaders(),
    );
     
    if (response.statusCode == 200) {
      return json.decode(response.body)['paymentDetails'];
    } else {
      throw Exception('Failed to get payment details');
    }
  }

  Future<List<dynamic>> getPaymentRequests() async {
    final response = await http.get(
      Uri.parse('$baseUrl/wallet/payment-requests'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['requests'] ?? [];
    } else {
      throw Exception('Failed to get payment requests');
    }
  }

  Future<void> withdrawWallet(double amount) async {
    final response = await http.post(
      Uri.parse('$baseUrl/wallet/withdraw'),
      headers: await _getHeaders(),
      body: json.encode({'amount': amount}),
    );
    
    if (response.statusCode != 200) {
      throw Exception('Failed to withdraw from wallet');
    }
  }

  // Investment
  Future<Map<String, dynamic>> buyShares(String projectId, int quantity) async {
    final response = await http.post(
      Uri.parse('$baseUrl/investor/buy'),
      headers: await _getHeaders(),
      body: json.encode({
        'project_id': projectId,
        'quantity': quantity,
        'type': 'SHARE',
      }),
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to buy shares');
    }
  }

  // Portfolio
  Future<List<dynamic>> getMyInvestments() async {
    final response = await http.get(
      Uri.parse('$baseUrl/investor/portfolio'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['investments'] ?? data['portfolio'] ?? [];
    } else {
      throw Exception('Failed to get investments');
    }
  }

  // Watchlist
  Future<List<dynamic>> getWatchlist() async {
    final response = await http.get(
      Uri.parse('$baseUrl/investor/watchlist'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['watchlist'] ?? [];
    } else {
      throw Exception('Failed to get watchlist');
    }
  }

  // Bank Details (Settings)
  Future<Map<String, dynamic>> getBankDetails() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/bank-details'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body)['bankDetails'] ?? {};
    } else {
      throw Exception('Failed to get bank details');
    }
  }

  Future<void> updateBankDetails(Map<String, String> details) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/bank-details'),
      headers: await _getHeaders(),
      body: json.encode(details),
    );
    
    if (response.statusCode != 200) {
      throw Exception('Failed to update bank details');
    }
  }

  // Withdrawal
  Future<void> requestWithdrawal(double amount, String paymentMethod, Map<String, dynamic> withdrawalDetails) async {
    final response = await http.post(
      Uri.parse('$baseUrl/wallet/withdraw'),
      headers: await _getHeaders(),
      body: json.encode({
        'amount': amount,
        'paymentMethod': paymentMethod,
        'withdrawalDetails': withdrawalDetails,
      }),
    );
    
    if (response.statusCode != 200) {
      final error = json.decode(response.body);
      throw Exception(error['message'] ?? 'Failed to submit withdrawal request');
    }
  }

  // ==========================================
  // NEW FEATURES: FDS, SHARES, CAPITAL TOOLS
  // ==========================================

  // FDS
  Future<List<dynamic>> getFDSchemes() async {
    final response = await http.get(
      Uri.parse('$baseUrl/investor/fds'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['schemes'] ?? [];
    } else {
      throw Exception('Failed to get FD schemes');
    }
  }

  Future<void> investInFD(String schemeId, double amount) async {
    final response = await http.post(
      Uri.parse('$baseUrl/fds/invest'),
      headers: await _getHeaders(),
      body: json.encode({
        'schemeId': schemeId,
        'amount': amount,
      }),
    );

    if (response.statusCode != 200) {
      final error = json.decode(response.body);
      throw Exception(error['message'] ?? 'Failed to invest in FD');
    }
  }

  // SHARES (Company Shares)
  Future<List<dynamic>> getShares() async {
    final response = await http.get(
      Uri.parse('$baseUrl/investor/shares'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['shares'] ?? [];
    } else {
      throw Exception('Failed to get shares');
    }
  }

  Future<void> buyCompanyShares(String shareId, int quantity) async {
    final response = await http.post(
      Uri.parse('$baseUrl/shares/$shareId/buy'),
      headers: await _getHeaders(),
      body: json.encode({
        'shareId': shareId,
        'quantity': quantity,
      }),
    );

    if (response.statusCode != 200) {
      final error = json.decode(response.body);
      throw Exception(error['message'] ?? 'Failed to buy shares');
    }
  }

  // CAPITAL OPTIONS (Loans, Partnerships)
  Future<List<dynamic>> getCapitalOptions() async {
    final response = await http.get(
      Uri.parse('$baseUrl/investor/capital'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['options'] ?? [];
    } else {
      throw Exception('Failed to get capital options');
    }
  }

  Future<void> investInCapitalOption(String optionId, double amount) async {
    final response = await http.post(
      Uri.parse('$baseUrl/capital/invest'),
      headers: await _getHeaders(),
      body: json.encode({
        'optionId': optionId,
        'amount': amount,
      }),
    );

    if (response.statusCode != 200) {
      final error = json.decode(response.body);
      throw Exception(error['message'] ?? 'Failed to invest in capital option');
    }
  }
}
