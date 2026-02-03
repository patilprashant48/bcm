import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart' as carousel;
import 'package:intl/intl.dart';
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
  int _currentAdIndex = 0;
  
  // Mock investment amounts per category
  final Map<String, double> _categoryInvestments = {
    'Shares': 2000,
    'FDs': 0,
    'SIP': 0,
    'Mutual Funds': 0,
    'Gold': 0,
    'Coins': 0,
  };

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
                    
                    // Ad Offer Zone - Slider
                    _buildAdOfferZone(),
                    
                    const SizedBox(height: 20),
                    
                    // Today's Reports Section
                    _buildTodaysReports(),
                    
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
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w500,
                fontSize: 11,
                fontStyle: FontStyle.normal,
                letterSpacing: 0.2,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              '₹${_categoryInvestments[title]?.toStringAsFixed(0) ?? '0'}',
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 13,
                fontStyle: FontStyle.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdOfferZone() {
    final List<Map<String, String>> adOffers = [
      {
        'title': 'Special Offer!',
        'description': 'Invest in FDs and get 12% returns',
        'color': '0xFFFF9800',
      },
      {
        'title': 'New Launch',
        'description': 'SIP plans starting from ₹500',
        'color': '0xFF4CAF50',
      },
      {
        'title': 'Gold Investment',
        'description': 'Digital gold with 0% making charges',
        'color': '0xFFFFC107',
      },
    ];

    return Column(
      children: [
        carousel.CarouselSlider(
          options: carousel.CarouselOptions(
            height: 120,
            autoPlay: true,
            autoPlayInterval: const Duration(seconds: 3),
            enlargeCenterPage: true,
            viewportFraction: 0.9,
            onPageChanged: (index, reason) {
              setState(() {
                _currentAdIndex = index;
              });
            },
          ),
          items: adOffers.map((ad) {
            return Builder(
              builder: (BuildContext context) {
                return GestureDetector(
                  onTap: () {
                    // Navigate to specific section based on ad
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Clicked: ${ad['title']}')),
                    );
                  },
                  child: Container(
                    width: MediaQuery.of(context).size.width,
                    margin: const EdgeInsets.symmetric(horizontal: 5.0),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Color(int.parse(ad['color']!)),
                          Color(int.parse(ad['color']!)).withOpacity(0.7),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            ad['title']!,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            ad['description']!,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Click to learn more →',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.white70,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          }).toList(),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: adOffers.asMap().entries.map((entry) {
            return Container(
              width: 8.0,
              height: 8.0,
              margin: const EdgeInsets.symmetric(horizontal: 4.0),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _currentAdIndex == entry.key
                    ? AppTheme.primaryColor
                    : Colors.grey,
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildTodaysReports() {
    final today = DateFormat('dd/MM/yyyy').format(DateTime.now());
    
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.greenAccent.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.greenAccent,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Today\'s',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Date: $today',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          // Reports List
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                _buildReportItem(
                  'Buy - click to go Transaction Report',
                  '(Transaction Report entry only today)',
                  Icons.shopping_cart,
                  Colors.blue,
                ),
                const Divider(height: 16),
                _buildReportItem(
                  'Selling - click to go Transaction Report',
                  '(Transaction Report entry only today)',
                  Icons.sell,
                  Colors.orange,
                ),
                const Divider(height: 16),
                _buildReportItem(
                  'Top up - click to go Transaction Report',
                  '(Report entry only today)',
                  Icons.arrow_upward,
                  Colors.green,
                ),
                const Divider(height: 16),
                _buildReportItem(
                  'Withdrawal',
                  '(Report entry only today)',
                  Icons.arrow_downward,
                  Colors.red,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReportItem(String title, String subtitle, IconData icon, Color color) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const TransactionHistoryScreen(filterType: null),
          ),
        );
      },
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.arrow_forward_ios, size: 14, color: AppTheme.textSecondary),
        ],
      ),
    );
  }
}
