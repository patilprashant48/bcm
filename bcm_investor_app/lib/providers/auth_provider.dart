import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  Map<String, dynamic>? _user;
  bool _isAuthenticated = false;
  bool _isLoading = true;

  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  final ApiService _apiService = ApiService();

  AuthProvider() {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    
    if (token != null) {
      try {
        final userData = await _apiService.getProfile();
        _user = userData;
        _isAuthenticated = true;
      } catch (e) {
        await logout();
      }
    }
    
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String mobile, String password) async {
    try {
      final response = await _apiService.login(mobile, password);
      final token = response['token'];
      final userData = response['user'];
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      
      _user = userData;
      _isAuthenticated = true;
      notifyListeners();
      
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> register(String name, String email, String mobile, String password) async {
    try {
      final response = await _apiService.register(name, email, mobile, password);
      final token = response['token'];
      final userData = response['user'];
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      
      _user = userData;
      _isAuthenticated = true;
      notifyListeners();
      
      return true;
    } catch (e) {
      print('Registration provider error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}
