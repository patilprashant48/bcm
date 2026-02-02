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
    try {
      final projects = await _apiService.getProjects(); // Fetch all
      setState(() {
        _allProjects = projects;
        _applyFilter();
        _isLoadingMarket = false;
      });
      _startPriceSimulation();
    } catch (e) {
      if (mounted) setState(() => _isLoadingMarket = false);
    }
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

  void _applyFilter() {
    if (_activeCategory == 'ALL') {
      _filteredProjects = List.from(_allProjects);
    } else {
      _filteredProjects = _allProjects.where((p) {
        // Assuming category field exists, or matching by name/type
        // If category field is missing in your mock/backend, we might need loose matching
        final cat = p['category']?.toString().toUpperCase() ?? 'SHARES';
        return cat == _activeCategory;
      }).toList();
    }
  }

  void _startPriceSimulation() {
    // Simulate live price changes every 3 seconds
    _priceTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (!mounted) return;
      setState(() {
        final random = Random();
        for (var project in _filteredProjects) {
          // Mock property for live price if not exists
          double currentPrice = (project['price_per_share'] ?? 100).toDouble();
          // Fluctuate by -1% to +1%
          double change = currentPrice * (random.nextDouble() * 0.02 - 0.01);
          project['current_market_price'] = currentPrice + change;
          
          // Also set a 'change_percent' for UI
          project['day_change_percent'] = (random.nextDouble() * 5 - 2.5); // -2.5% to +2.5%
        }
      });
    });
  }

  void _onCategorySelected(String category) {
    setState(() {
      _activeCategory = category;
      _applyFilter();
    });
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
            Tab(text: 'Transactions (Self)'),
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
              _buildCategoryChip('ALL', 'All'),
              _buildCategoryChip('SHARES', 'Shares'),
              _buildCategoryChip('FDS', 'FDs'),
              _buildCategoryChip('SIP', 'SIP'),
              _buildCategoryChip('MUTUAL_FUNDS', 'Mutual Funds'),
              _buildCategoryChip('GOLD', 'Gold'),
              _buildCategoryChip('COINS', 'Coins'),
            ],
          ),
        ),
        
        // List
        Expanded(
          child: _isLoadingMarket
              ? const Center(child: CircularProgressIndicator())
              : _filteredProjects.isEmpty
                  ? const Center(child: Text('No projects found'))
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _filteredProjects.length,
                      separatorBuilder: (_, __) => const Divider(),
                      itemBuilder: (context, index) {
                        final item = _filteredProjects[index];
                        return _buildMarketItem(item);
                      },
                    ),
        ),
      ],
    );
  }

  Widget _buildCategoryChip(String id, String label) {
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
    final price = (item['current_market_price'] ?? item['price_per_share'] ?? 100).toDouble();
    final change = (item['day_change_percent'] ?? 0.0).toDouble();
    final isPositive = change >= 0;

    return InkWell(
      onTap: () {
        // Go to Project Details / Share Market Screen
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => ProjectDetailsScreen(project: item)),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            // Icon/Avatar
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  (item['project_name'] ?? 'S')[0],
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
              ),
            ),
            const SizedBox(width: 12),
            
            // Name & Company
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item['project_name'] ?? 'Unknown',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  Text(
                    item['category'] ?? 'Stock',
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ],
              ),
            ),
            
            // Graph (Mock)
            // SizedBox(width: 50, child: Icon(isPositive ? Icons.show_chart : Icons.trending_down, color: isPositive ? Colors.green : Colors.red)),
            
            // Price & Change
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '₹${price.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: isPositive ? AppTheme.greenAccent : Colors.red,
                  ),
                ),
                Text(
                  '${isPositive ? '+' : ''}${change.toStringAsFixed(2)}%',
                  style: TextStyle(
                    color: isPositive ? AppTheme.greenAccent : Colors.red,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
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
