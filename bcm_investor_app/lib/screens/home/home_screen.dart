import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../config/theme.dart';
import '../../widgets/wallet_card.dart';
import '../../widgets/project_card.dart';
import 'all_projects_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _wallet;
  List<dynamic> _projects = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final walletData = await _apiService.getWallet();
      // The backend returns { wallets: [...] } now. Correctly parse this.
      // Or if using the old map structure, handle both.
      
      Map<String, dynamic> businessWallet = {};
      Map<String, dynamic> incomeWallet = {};

      if (walletData.containsKey('wallets')) {
        final List<dynamic> wallets = walletData['wallets'];
        businessWallet = wallets.firstWhere(
          (w) => w['type'] == 'INVESTOR_BUSINESS', 
          orElse: () => {'balance': 0}
        );
        incomeWallet = wallets.firstWhere(
          (w) => w['type'] == 'INVESTOR_INCOME', 
          orElse: () => {'balance': 0}
        );
      } else {
        // Fallback for old structure if strictly Map
        businessWallet = {'balance': walletData['balance'] ?? 0};
        incomeWallet = {'balance': walletData['income_balance'] ?? 0};
      }

      final projects = await _apiService.getProjects();
      
      setState(() {
        _wallet = {
          'business_balance': businessWallet['balance'],
          'income_balance': incomeWallet['balance']
        };
        _projects = projects;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load data: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'), // Changed title
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Wallet Cards
                    WalletCard(
                      title: 'Business Wallet',
                      balance: (_wallet?['business_balance'] ?? 0).toDouble(),
                      icon: Icons.account_balance_wallet,
                      color: AppTheme.primaryColor,
                    ),
                    const SizedBox(height: 12),
                    WalletCard(
                      title: 'Income Wallet',
                      balance: (_wallet?['income_balance'] ?? 0).toDouble(),
                      icon: Icons.trending_up,
                      color: AppTheme.greenAccent,
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Investment Categories (Buckets)
                    const Text(
                      'Investment Buckets',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    
                    SizedBox(
                      height: 100,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          _buildCategoryCard('Shares', Icons.show_chart, Colors.blue),
                          _buildCategoryCard('Stocks', Icons.candlestick_chart, Colors.indigo),
                          _buildCategoryCard('Loans', Icons.account_balance, Colors.purple),
                          _buildCategoryCard('FDs', Icons.savings, Colors.orange),
                          _buildCategoryCard('Partnerships', Icons.handshake, Colors.teal),
                          _buildCategoryCard('Investments', Icons.monetization_on, Colors.green),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Live Projects
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Live Projects',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const AllProjectsScreen(),
                              ),
                            );
                          },
                          child: const Text('See All'),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 12),
                    
                    // Projects List
                    if (_projects.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: Text(
                            'No projects available',
                            style: TextStyle(color: AppTheme.textSecondary),
                          ),
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _projects.length,
                        itemBuilder: (context, index) {
                          return ProjectCard(project: _projects[index]);
                        },
                      ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildCategoryCard(String title, IconData icon, Color color) {
    return Container(
      width: 100,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(
            title,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
