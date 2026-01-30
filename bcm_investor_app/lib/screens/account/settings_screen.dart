import 'package:flutter/material.dart';
import '../../config/theme.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'bank_details_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _biometricsEnabled = false;
  bool _darkMode = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _notificationsEnabled = prefs.getBool('notifications_enabled') ?? true;
      _biometricsEnabled = prefs.getBool('biometrics_enabled') ?? false;
      _darkMode = prefs.getBool('dark_mode') ?? true;
    });
  }

  Future<void> _toggleSetting(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
    setState(() {
      if (key == 'notifications_enabled') _notificationsEnabled = value;
      if (key == 'biometrics_enabled') _biometricsEnabled = value;
      if (key == 'dark_mode') _darkMode = value;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('App Preferences', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          SwitchListTile(
            title: const Text('Push Notifications', style: TextStyle(color: AppTheme.textPrimary)),
            value: _notificationsEnabled,
            onChanged: (val) => _toggleSetting('notifications_enabled', val),
            activeColor: AppTheme.primaryColor,
          ),
          SwitchListTile(
            title: const Text('Dark Mode', style: TextStyle(color: AppTheme.textPrimary)),
            value: _darkMode,
            onChanged: (val) => _toggleSetting('dark_mode', val),
            activeColor: AppTheme.primaryColor,
          ),
          
          const Divider(height: 32, color: Colors.grey),
          
          const Text('Security', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          SwitchListTile(
            title: const Text('Biometric Login', style: TextStyle(color: AppTheme.textPrimary)),
            subtitle: const Text('Use fingerprint/face ID', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
            value: _biometricsEnabled,
            onChanged: (val) => _toggleSetting('biometrics_enabled', val),
            activeColor: AppTheme.primaryColor,
          ),
          ListTile(
            title: const Text('Change Password', style: TextStyle(color: AppTheme.textPrimary)),
            trailing: const Icon(Icons.chevron_right, color: Colors.grey),
             onTap: () {
                // Navigate to change password screen
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password change not implemented in this demo')));
             },
           ),
           ListTile(
             title: const Text('Bank Details', style: TextStyle(color: AppTheme.textPrimary)),
             subtitle: const Text('For Withdrawals', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
             trailing: const Icon(Icons.chevron_right, color: Colors.grey),
             onTap: () {
               Navigator.push(
                 context,
                 MaterialPageRoute(builder: (context) => const BankDetailsScreen()),
               );
             },
           ),
          
          const Divider(height: 32, color: Colors.grey),
          
          const Text('Legal', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          ListTile(
            title: const Text('Privacy Policy', style: TextStyle(color: AppTheme.textPrimary)),
            trailing: const Icon(Icons.link, color: Colors.grey),
            onTap: () {},
          ),
          ListTile(
            title: const Text('Terms of Service', style: TextStyle(color: AppTheme.textPrimary)),
            trailing: const Icon(Icons.link, color: Colors.grey),
            onTap: () {},
          ),
          
          const SizedBox(height: 32),
          const Center(
            child: Text(
              'App Version 1.0.0+1',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          )
        ],
      ),
    );
  }
}
