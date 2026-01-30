import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../config/theme.dart';
import '../../widgets/wallet_card.dart';
import '../../widgets/project_card.dart';
import '../account/transaction_history_screen.dart';
import '../wallet/wallet_screen.dart';
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
        title: const Text('Welcome Investor'),
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
                      title: 'Main Wallet',
                      balance: (_wallet?['business_balance'] ?? 0).toDouble(),
                      icon: Icons.account_balance_wallet,
                      color: AppTheme.primaryColor,
                      showTopUp: true,
                      onTopUp: () {
                         _showTransactionDialog(context, 'Top Up', (amount) async {
                           await _apiService.topUpWallet(amount);
                         });
                      },
                      onTap: () {
                        // Navigate to WalletScreen for Top Up / Overview
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const WalletScreen()),
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    WalletCard(
                      title: 'Income Wallet',
                      balance: (_wallet?['income_balance'] ?? 0).toDouble(),
                      icon: Icons.trending_up,
                      color: AppTheme.greenAccent,
                      showWithdraw: true,
                      onWithdraw: () {
                        _showTransactionDialog(context, 'Withdraw', (amount) async {
                           await _apiService.withdrawWallet(amount);
                        });
                      },
                      onTap: () {
                        // Navigate to TransactionHistoryScreen with DEBIT filter for Withdrawal History
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const TransactionHistoryScreen(filterType: 'DEBIT'),
                          ),
                        );
                      },
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Investment Categories (Buckets)
                    const Text(
                      'Investment Categories',
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
                          _buildCategoryCard('Loans', Icons.account_balance, Colors.purple),
                          _buildCategoryCard('FDs', Icons.savings, Colors.orange),
                          _buildCategoryCard('Coins', Icons.monetization_on, Colors.amber),
                          _buildCategoryCard('Gold', Icons.circle, Colors.amberAccent),
                          _buildCategoryCard('Estate', Icons.home_work, Colors.brown),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Live Project Lists
                    _buildProjectSection('Live Projects - Top Selling', _projects),
                    const SizedBox(height: 16),
                    _buildProjectSection('Today Top', _projects.reversed.toList()), // Mock different order
                    const SizedBox(height: 16),
                    _buildProjectSection('Top Buying', _projects),
                    
                    const SizedBox(height: 24),

                    // Transaction Report Snippets
                    _buildTransactionSnippet('Recent Top Ups', 'CREDIT', context),
                    const SizedBox(height: 16),
                    _buildTransactionSnippet('Recent Withdrawals', 'DEBIT', context),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildProjectSection(String title, List<dynamic> projects) {
    if (projects.isEmpty) return const SizedBox.shrink();
    
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
        const SizedBox(height: 8),
        SizedBox(
          height: 180, // Height for horizontal project card scroll similar to categories if we wanted, but let's stick to list or maybe horizontal?
          // The previous implementation was a vertical list. Let's make these horizontal scrolls for "Top Selling" etc looks better.
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: projects.length > 5 ? 5 : projects.length, // Limit to 5
            itemBuilder: (context, index) {
              // We need a constrained width project card for horizontal view
              return SizedBox(
                width: 280,
                child: Padding(
                  padding: const EdgeInsets.only(right: 12),
                  child: ProjectCard(project: projects[index]),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTransactionSnippet(String title, String type, BuildContext context) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              TextButton(
                onPressed: () {
                   Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const TransactionHistoryScreen(filterType: null)), // Pass filter if supported
                   );
                },
                child: const Text('More'),
              ),
            ],
          ),
          // Placeholder for last 5 entries - fetching this ideally requires the transaction list in state
          // For now, we will just show a static message or we need to fetch transactions in _loadData
          const Card(
            child: Padding(
               padding: EdgeInsets.all(16),
               child: Center(child: Text('View full history in Report Screen', style: TextStyle(color: AppTheme.textSecondary))),
            ),
          )
        ],
      );
  }

  Future<void> _showTransactionDialog(
      BuildContext context, String title, Function(double) onConfirm) async {
    final amountController = TextEditingController();
    return showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(title),
          content: TextField(
            controller: amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Amount',
              prefixText: '₹',
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final amount = double.tryParse(amountController.text);
                if (amount != null && amount > 0) {
                  Navigator.pop(context);
                  try {
                    await onConfirm(amount);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                            content: Text('$title successful'),
                            backgroundColor: Colors.green),
                      );
                      _loadData();
                    }
                  } catch (e) {
                     if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                            content: Text('Failed: $e'),
                            backgroundColor: Colors.red),
                      );
                    }
                  }
                }
              },
              child: const Text('Confirm'),
            ),
          ],
        );
      },
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
