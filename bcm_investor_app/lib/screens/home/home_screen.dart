import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../config/theme.dart';
import '../../widgets/wallet_card.dart';
import '../../widgets/project_card.dart';
import '../account/transaction_history_screen.dart';
import '../wallet/wallet_screen.dart';
import '../wallet/top_up_screen.dart';
import '../wallet/withdrawal_screen.dart';
import '../market/market_screen.dart';
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
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Wallet Cards - Side by Side
                    Row(
                      children: [
                        Expanded(
                          child: WalletCard(
                            title: 'Business Wallet',
                            balance: (_wallet?['business_balance'] ?? 0).toDouble(),
                            icon: Icons.business_center,
                            color: AppTheme.primaryColor,
                            showTopUp: true,
                            onTopUp: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const TopUpScreen()),
                              );
                            },
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const WalletScreen()),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: WalletCard(
                            title: 'Income Wallet',
                            balance: (_wallet?['income_balance'] ?? 0).toDouble(),
                            icon: Icons.account_balance_wallet,
                            color: AppTheme.greenAccent,
                            showWithdraw: true,
                            onWithdraw: () {
                              double currentBalance = (_wallet?['income_balance'] ?? 0).toDouble();
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => WithdrawalScreen(availableBalance: currentBalance)),
                              ).then((_) => _loadData());
                            },
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const WalletScreen()),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 20),
                    
                    // Investment Categories (Buckets)
                    const Text(
                      'Investment Categories',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    
                    // Categories Grid - 3-column layout
                    GridView.count(
                      crossAxisCount: 3,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 8,
                      crossAxisSpacing: 8,
                      childAspectRatio: 0.95,
                      children: [
                        _buildCategoryCard('Shares', Icons.show_chart, Colors.blue),
                        _buildCategoryCard('FDs', Icons.savings, Colors.orange),
                        _buildCategoryCard('SIP', Icons.trending_up, Colors.green),
                        _buildCategoryCard('Mutual Funds', Icons.pie_chart, Colors.teal),
                        _buildCategoryCard('Gold', Icons.circle, Colors.yellow.shade700),
                        _buildCategoryCard('Coins', Icons.monetization_on, Colors.amber),
                      ],
                    ),
                    
                    const SizedBox(height: 20),
                    
                    // Live Projects Section
                    _buildProjectSection('Live Projects', _projects),
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
                  MaterialPageRoute(builder: (context) => AllProjectsScreen(projects: _projects)),
                );
              },
              child: const Text('See All'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        // Display all projects in a column
        ...projects.map((project) => ProjectCard(project: project)).toList(),
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
    return GestureDetector(
      onTap: () {
        // Map category titles to filter values
        String filterValue = 'ALL';
        switch (title) {
          case 'Shares':
            filterValue = 'SHARES';
            break;
          case 'FDs':
            filterValue = 'FDS';
            break;
          case 'SIP':
            filterValue = 'SIP';
            break;
          case 'Mutual Funds':
            filterValue = 'MUTUAL_FUNDS';
            break;
          case 'Gold':
            filterValue = 'GOLD';
            break;
          case 'Coins':
            filterValue = 'COINS';
            break;
        }
        
        // Navigate to MarketScreen with filter
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => MarketScreen(
              initialFilter: filterValue,
            ),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 4),
            Text(
              title,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 10,
                fontStyle: FontStyle.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
