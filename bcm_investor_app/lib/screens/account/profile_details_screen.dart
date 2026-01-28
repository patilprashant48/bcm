import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';

class ProfileDetailsScreen extends StatefulWidget {
  const ProfileDetailsScreen({Key? key}) : super(key: key);

  @override
  State<ProfileDetailsScreen> createState() => _ProfileDetailsScreenState();
}

class _ProfileDetailsScreenState extends State<ProfileDetailsScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  Map<String, dynamic>? _userProfile;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final profile = await _apiService.getProfile();
      setState(() {
        _userProfile = profile;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 48, color: AppTheme.errorColor),
                      const SizedBox(height: 16),
                      Text(_error!),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadProfile,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Center(
                        child: Stack(
                          children: [
                            Container(
                              width: 100,
                              height: 100,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppTheme.primaryColor.withOpacity(0.1),
                                border: Border.all(
                                  color: AppTheme.primaryColor,
                                  width: 2,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  (_userProfile?['name'] ?? 'U')[0].toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 40,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryColor,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      _buildInfoSection(
                        'Personal Information',
                        [
                          _buildInfoRow('Full Name', _userProfile?['name'] ?? 'N/A'),
                          _buildInfoRow('Email', _userProfile?['email'] ?? 'N/A'),
                          _buildInfoRow('Mobile', _userProfile?['mobile'] ?? 'N/A'),
                        ],
                      ),
                      const SizedBox(height: 24),
                      _buildInfoSection(
                        'Account Status',
                        [
                          _buildInfoRow('Role', _userProfile?['role'] ?? 'INVESTOR'),
                          _buildInfoRow(
                            'Status', 
                            _userProfile?['isActive'] == true ? 'Active' : 'Inactive',
                            isValueHighlight: true,
                            valueColor: _userProfile?['isActive'] == true 
                                ? Colors.green 
                                : Colors.red,
                          ),
                          _buildInfoRow('Joined', _userProfile?['createdAt']?.toString().split('T')[0] ?? 'N/A'),
                        ],
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildInfoSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: children,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isValueHighlight = false, Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 14,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              color: valueColor ?? AppTheme.textPrimary,
              fontWeight: isValueHighlight ? FontWeight.bold : FontWeight.w500,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }
}
