import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'https://bcm-6f7f.onrender.com/api'; // Production backend on Render
  
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
      Uri.parse('$baseUrl/investor/projects'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body)['projects'];
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

  // Investment
  Future<Map<String, dynamic>> buyShares(int projectId, int quantity) async {
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
      Uri.parse('$baseUrl/investor/investments'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body)['investments'];
    } else {
      throw Exception('Failed to get investments');
    }
  }
}
