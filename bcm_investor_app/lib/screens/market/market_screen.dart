import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../config/theme.dart';
import '../home/project_details_screen.dart';

class MarketScreen extends StatefulWidget {
  final String? initialFilter; // e.g. 'FDS', 'SHARES'

  const MarketScreen({Key? key, this.initialFilter}) : super(key: key);

  @override
  State<MarketScreen> createState() => _MarketScreenState();
}

class _MarketScreenState extends State<MarketScreen> with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  late TabController _tabController;
  
  // Market Data
  List<dynamic> _allProjects = [];
  List<dynamic> _filteredProjects = [];
  bool _isLoadingMarket = true;
  String _activeCategory = 'ALL';
  Timer? _priceTimer;

  // Transaction Data
  List<dynamic> _transactions = [];
  bool _isLoadingTransactions = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    
    // If initial filter is provided, set category
    if (widget.initialFilter != null) {
      _activeCategory = widget.initialFilter!;
    }

    _loadMarketData();
    
    // Listen to tab changes to load transactions when needed
    _tabController.addListener(() {
      if (_tabController.index == 1) {
        _loadTransactions();
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _priceTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadMarketData() async {
    setState(() => _isLoadingMarket = true);
    try {
      List<dynamic> data = [];
      
      if (_activeCategory == 'FDS') {
        data = await _apiService.getFDSchemes();
      } else if (_activeCategory == 'SHARES') {
        data = await _apiService.getShares();
      } else if (_activeCategory == 'SIP') { 
        // Showing Capital Options (Partnerships/Loans) as SIP/Investment options for now
        data = await _apiService.getCapitalOptions();
      } else if (_activeCategory == 'SAVING' || _activeCategory == 'GOLD' || _activeCategory == 'COINS') {
        // Placeholder for other categories
        data = []; 
      } else {
        // ALL or default - show Projects
        data = await _apiService.getProjects();
      }

      setState(() {
        _filteredProjects = data;
        _isLoadingMarket = false;
      });

      // Only start price sim for Shares/Projects
      if (_activeCategory == 'SHARES' || _activeCategory == 'ALL') {
         _startPriceSimulation();
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingMarket = false);
      print('Load market data error: $e');
    }
  }



  void _startPriceSimulation() {
    _priceTimer?.cancel();
    _priceTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (!mounted) return;
      setState(() {
        final random = Random();
        for (var item in _filteredProjects) {
          // Only simulate if it looks like a share/project
          if (item.containsKey('currentPrice') || item.containsKey('price_per_share')) {
             double currentPrice = (item['currentPrice'] ?? item['price_per_share'] ?? 100).toDouble();
             double change = currentPrice * (random.nextDouble() * 0.02 - 0.01);
             item['currentPrice'] = currentPrice + change; // Update for UI
             item['day_change_percent'] = (random.nextDouble() * 5 - 2.5);
          }
        }
      });
    });
  }

  Future<void> _loadTransactions() async {
    setState(() => _isLoadingTransactions = true);
    try {
      final txns = await _apiService.getTransactions();
      setState(() {
        _transactions = txns;
        _isLoadingTransactions = false;
      });
    } catch (e) {
      if (mounted) setState(() => _isLoadingTransactions = false);
    }
  }

  void _onCategorySelected(String category) {
    setState(() {
      _activeCategory = category;
    });
    _loadMarketData(); // Reload data for new category
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Market'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primaryColor,
          unselectedLabelColor: Colors.grey,
          indicatorColor: AppTheme.primaryColor,
          tabs: const [
            Tab(text: 'Market'),
            Tab(text: 'Transactions'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildMarketView(),
          _buildTransactionsView(),
        ],
      ),
    );
  }

  // --- MARKET VIEW ---
  Widget _buildMarketView() {
    return Column(
      children: [
        // Categories
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              _buildCategoryChip('ALL', 'Projects'),
              _buildCategoryChip('SHARES', 'Shares'),
              _buildCategoryChip('FDS', 'FDs'),
              _buildCategoryChip('SIP', 'Partnership'), // Reusing SIP for Partnership/Capital
              _buildCategoryChip('SAVING', 'Saving'),
              _buildCategoryChip('GOLD', 'Gold'),
            ],
          ),
        ),
        
        // List
        Expanded(
           child: _isLoadingMarket
              ? const Center(child: CircularProgressIndicator())
              : _filteredProjects.isEmpty
                  ? Center(child: Text('No ${_activeCategory.toLowerCase()} available'))
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _filteredProjects.length,
                      separatorBuilder: (_, __) => const Divider(),
                      itemBuilder: (context, index) {
                        return _buildMarketItem(_filteredProjects[index]);
                      },
                    ),
        ),
      ],
    );
  }

  Widget _buildCategoryChip(String id, String label) {
    // ... (Same as before)
    final isSelected = _activeCategory == id;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (bool selected) {
          if (selected) _onCategorySelected(id);
        },
        selectedColor: AppTheme.primaryColor.withOpacity(0.2),
        labelStyle: TextStyle(
          color: isSelected ? AppTheme.primaryColor : Colors.black,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
    );
  }

  Widget _buildMarketItem(Map<String, dynamic> item) {
    // Determine Type
    bool isFDS = item.containsKey('schemeId') || item.containsKey('interestPercent');
    bool isShare = item.containsKey('shareName'); // Share model has shareName
    bool isOption = item.containsKey('optionType'); // Capital Option

    if (isFDS) return _buildFDSItem(item);
    if (isShare) return _buildShareItem(item);
    if (isOption) return _buildCapitalOptionItem(item);

    // Default: Project
    return _buildProjectItem(item);
  }

  Widget _buildFDSItem(Map<String, dynamic> item) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(child: Icon(Icons.savings, color: Colors.orange)),
        title: Text(item['name'] ?? 'FD Scheme'),
        subtitle: Text('Interest: ${item['interestPercent']}% | Min: ₹${item['minAmount']}'),
        trailing: ElevatedButton(
          child: Text('Invest'),
          onPressed: () {
            // Must use _id for backend findById
            _showInvestDialog('FDS', item['_id'], item['name']);
          },
        ),
      ),
    );
  }

  Widget _buildShareItem(Map<String, dynamic> item) {
    double price = (item['currentPrice'] ?? item['shareValue'] ?? 0).toDouble();
    double change = (item['day_change_percent'] ?? 0.0).toDouble();
    bool isPositive = change >= 0;

    return Card(
      child: ListTile(
        leading: CircleAvatar(child: Text((item['shareName']??'S')[0])),
        title: Text(item['shareName'] ?? 'Share'),
        subtitle: Text('Price: ₹$price'),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text('₹${price.toStringAsFixed(2)}', style: TextStyle(fontWeight: FontWeight.bold, color: isPositive ? Colors.green : Colors.red)),
            Text('${isPositive?'+':''}${change.toStringAsFixed(2)}%', style: TextStyle(fontSize: 10, color: isPositive ? Colors.green : Colors.red)),
            // Text('Buy', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold))
          ],
        ),
        onTap: () => _showInvestDialog('SHARE', item['_id'], item['shareName']),
      ),
    );
  }

  Widget _buildCapitalOptionItem(Map<String, dynamic> item) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(child: Icon(Icons.business, color: Colors.blue)),
        title: Text('${item['optionType']} Request'),
        subtitle: Text(item['optionType'] == 'LOAN' 
            ? 'Loan: ₹${item['loanAmount']} @ ${item['interestRate']}%'
            : 'Partnership: Min ₹${item['minimumInvestment']}'),
        trailing: ElevatedButton(
          child: Text('View'),
          onPressed: () => _showInvestDialog('CAPITAL', item['_id'], item['optionType']),
        ),
      ),
    );
  }

  Widget _buildProjectItem(Map<String, dynamic> item) {
    // Previous Project Logic
    final price = (item['current_market_price'] ?? 100).toDouble();
    
    return ListTile(
      leading: CircleAvatar(child: Text((item['project_name'] ?? 'P')[0])),
      title: Text(item['project_name'] ?? 'Project'),
      subtitle: Text(item['category'] ?? 'Project'),
      trailing: Text('₹${price.toStringAsFixed(0)}'),
      onTap: () {
          Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => ProjectDetailsScreen(project: item)),
        );
      },
    );
  }

  void _showInvestDialog(String type, String id, String name) {
    showDialog(
      context: context,
      builder: (context) {
        final _amountController = TextEditingController();
        return AlertDialog(
          title: Text('Invest in $name'),
          content: TextField(
            controller: _amountController,
            decoration: InputDecoration(labelText: 'Amount / Quantity'),
            keyboardType: TextInputType.number,
          ),
          actions: [
            TextButton(child: Text('Cancel'), onPressed: () => Navigator.pop(context)),
            ElevatedButton(
              child: Text('Confirm'),
              onPressed: () async {
                final val = double.tryParse(_amountController.text);
                if (val != null) {
                   Navigator.pop(context); // Close dialog first
                   try {
                     if (type == 'FDS') await _apiService.investInFD(id, val);
                     else if (type == 'SHARE') await _apiService.buyCompanyShares(id, val.toInt()); // Quantity
                     else if (type == 'CAPITAL') await _apiService.investInCapitalOption(id, val);
                     
                     ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Investment Successful!')));
                   } catch(e) {
                     ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                   }
                }
              },
            )
          ],
        );
      },
    );
  }

  // --- TRANSACTIONS VIEW ---
  Widget _buildTransactionsView() {
    if (_isLoadingTransactions) return const Center(child: CircularProgressIndicator());
    if (_transactions.isEmpty) return const Center(child: Text('No transactions found'));

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _transactions.length,
      separatorBuilder: (_, __) => const Divider(),
      itemBuilder: (context, index) {
        final txn = _transactions[index];
        final type = txn['type'] ?? 'UNKNOWN';
        final isCredit = type == 'DEPOSIT' || type == 'CREDIT';
        
        return ListTile(
          leading: CircleAvatar(
             backgroundColor: isCredit ? Colors.green[100] : Colors.red[100],
             child: Icon(
               isCredit ? Icons.arrow_downward : Icons.arrow_upward,
               color: isCredit ? Colors.green : Colors.red,
             ),
          ),
          title: Text(type),
          subtitle: Text(txn['date']?.toString().substring(0, 10) ?? ''),
          trailing: Text(
            '${isCredit ? '+' : '-'} ₹${txn['amount']}',
            style: TextStyle(
              color: isCredit ? Colors.green : Colors.red,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        );
      },
    );
  }
}
