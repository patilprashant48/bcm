import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';
import '../home/project_details_screen.dart';

class WatchlistScreen extends StatefulWidget {
  const WatchlistScreen({Key? key}) : super(key: key);

  @override
  State<WatchlistScreen> createState() => _WatchlistScreenState();
}

class _WatchlistScreenState extends State<WatchlistScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _watchlist = [];
  bool _isLoading = true;
  Timer? _priceTimer;

  @override
  void initState() {
    super.initState();
    _loadWatchlist();
    _startLivePriceUpdates();
  }

  @override
  void dispose() {
    _priceTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadWatchlist() async {
    try {
      final watchlist = await _apiService.getWatchlist();
      setState(() {
        _watchlist = watchlist;
        _isLoading = false;
      });
    } catch (e) {
      // If API fails, use mock data
      setState(() {
        _watchlist = _getMockWatchlist();
        _isLoading = false;
      });
    }
  }

  List<Map<String, dynamic>> _getMockWatchlist() {
    return [
      {
        'id': 1,
        'project_name': 'Green Energy Solar Park',
        'business_name': 'EcoPower Ltd.',
        'category': 'SHARES',
        'price_per_share': 125.50,
        'current_market_price': 125.50,
        'day_change_percent': 0.0,
        'expected_roi': 15,
        'min_investment': 5000,
      },
      {
        'id': 2,
        'project_name': 'TechHub Expansion',
        'business_name': 'Innovate Tech.',
        'category': 'SHARES',
        'price_per_share': 89.75,
        'current_market_price': 89.75,
        'day_change_percent': 0.0,
        'expected_roi': 18,
        'min_investment': 10000,
      },
      {
        'id': 3,
        'project_name': 'Gold Reserve Fund',
        'business_name': 'Precious Metals Inc.',
        'category': 'GOLD',
        'price_per_share': 5420.00,
        'current_market_price': 5420.00,
        'day_change_percent': 0.0,
        'expected_roi': 8,
        'min_investment': 25000,
      },
      {
        'id': 4,
        'project_name': 'Real Estate Portfolio',
        'business_name': 'Urban Developers',
        'category': 'ESTATE',
        'price_per_share': 250000.00,
        'current_market_price': 250000.00,
        'day_change_percent': 0.0,
        'expected_roi': 12,
        'min_investment': 100000,
      },
    ];
  }

  void _startLivePriceUpdates() {
    _priceTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (!mounted) return;
      setState(() {
        final random = Random();
        for (var item in _watchlist) {
          double currentPrice = (item['current_market_price'] ?? item['price_per_share'] ?? 100).toDouble();
          // Fluctuate by -0.5% to +0.5%
          double change = currentPrice * (random.nextDouble() * 0.01 - 0.005);
          item['current_market_price'] = currentPrice + change;
          item['day_change_percent'] = (random.nextDouble() * 4 - 2); // -2% to +2%
        }
      });
    });
  }

  Future<void> _removeFromWatchlist(int index) async {
    final item = _watchlist[index];
    setState(() {
      _watchlist.removeAt(index);
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${item['project_name']} removed from watchlist'),
        action: SnackBarAction(
          label: 'UNDO',
          onPressed: () {
            setState(() {
              _watchlist.insert(index, item);
            });
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Watchlist'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadWatchlist,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _watchlist.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.bookmark_border, size: 64, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text(
                        'No items in watchlist',
                        style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Add projects from Market to track them here',
                        style: TextStyle(fontSize: 14, color: Colors.grey[500]),
                      ),
                    ],
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _watchlist.length,
                  separatorBuilder: (_, __) => const Divider(height: 24),
                  itemBuilder: (context, index) {
                    final item = _watchlist[index];
                    return _buildWatchlistItem(item, index);
                  },
                ),
    );
  }

  Widget _buildWatchlistItem(Map<String, dynamic> item, int index) {
    final price = (item['current_market_price'] ?? item['price_per_share'] ?? 100).toDouble();
    final change = (item['day_change_percent'] ?? 0.0).toDouble();
    final isPositive = change >= 0;
    final category = item['category'] ?? 'SHARES';

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => ProjectDetailsScreen(project: item)),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.cardBackground,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Icon
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: _getCategoryColor(category).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: Icon(
                      _getCategoryIcon(category),
                      color: _getCategoryColor(category),
                      size: 24,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                
                // Name & Category
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item['project_name'] ?? 'Unknown',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item['business_name'] ?? category,
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                
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
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: (isPositive ? AppTheme.greenAccent : Colors.red).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '${isPositive ? '+' : ''}${change.toStringAsFixed(2)}%',
                        style: TextStyle(
                          color: isPositive ? AppTheme.greenAccent : Colors.red,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                
                // Remove button
                IconButton(
                  icon: const Icon(Icons.bookmark, color: AppTheme.primaryColor),
                  onPressed: () => _removeFromWatchlist(index),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // ROI & Min Investment
            Row(
              children: [
                _buildInfoChip('ROI: ${item['expected_roi']}%', AppTheme.greenAccent),
                const SizedBox(width: 8),
                _buildInfoChip('Min: ₹${item['min_investment']}', Colors.blue),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'SHARES':
        return Icons.show_chart;
      case 'GOLD':
        return Icons.circle;
      case 'ESTATE':
        return Icons.home_work;
      case 'COINS':
        return Icons.monetization_on;
      case 'FDS':
        return Icons.savings;
      default:
        return Icons.business;
    }
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'SHARES':
        return Colors.blue;
      case 'GOLD':
        return Colors.yellow.shade700;
      case 'ESTATE':
        return Colors.brown;
      case 'COINS':
        return Colors.amber;
      case 'FDS':
        return Colors.orange;
      default:
        return AppTheme.primaryColor;
    }
  }
}
