import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';

class HoldingsScreen extends StatefulWidget {
  const HoldingsScreen({Key? key}) : super(key: key);

  @override
  State<HoldingsScreen> createState() => _HoldingsScreenState();
}

class _HoldingsScreenState extends State<HoldingsScreen> with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  late TabController _tabController;
  
  String _selectedCategory = 'All';
  DateTime _fromDate = DateTime.now().subtract(const Duration(days: 30));
  DateTime _toDate = DateTime.now();
  
  bool _isLoading = true;
  List<Map<String, dynamic>> _holdings = [];
  
  // Summary totals
  double _totalInvestment = 0;
  double _totalValue = 0;
  double _totalProfit = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 7, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() {
          _selectedCategory = _getCategoryFromIndex(_tabController.index);
        });
        _loadHoldings();
      }
    });
    _loadHoldings();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String _getCategoryFromIndex(int index) {
    const categories = ['All', 'Share', 'FD', 'SIP', 'Saving', 'Gold', 'Coin'];
    return categories[index];
  }

  Future<void> _loadHoldings() async {
    setState(() => _isLoading = true);
    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      await Future.delayed(const Duration(milliseconds: 500));
      
      List<Map<String, dynamic>> mockData = [
        {
          'category': 'Share',
          'scheme': 'HDFC Bank',
          'investment': 50000.0,
          'value': 55000.0,
          'profit': 5000.0,
        },
        {
          'category': 'FD',
          'scheme': 'gr fd',
          'investment': 20000.0,
          'value': 20500.0,
          'profit': 500.0,
        },
        {
          'category': 'Share',
          'scheme': 'Reliance',
          'investment': 30000.0,
          'value': 32000.0,
          'profit': 2000.0,
        },
        {
          'category': 'SIP',
          'scheme': 'Partnership A',
          'investment': 15000.0,
          'value': 15750.0,
          'profit': 750.0,
        },
      ];

      // Filter by category if not "All"
      if (_selectedCategory != 'All') {
        mockData = mockData.where((item) => item['category'] == _selectedCategory).toList();
      }

      // Calculate totals
      double investment = 0;
      double value = 0;
      double profit = 0;
      
      for (var item in mockData) {
        investment += item['investment'] as double;
        value += item['value'] as double;
        profit += item['profit'] as double;
      }

      setState(() {
        _holdings = mockData;
        _totalInvestment = investment;
        _totalValue = value;
        _totalProfit = profit;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load holdings: $e')),
        );
      }
    }
  }

  Future<void> _selectDate(BuildContext context, bool isFromDate) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isFromDate ? _fromDate : _toDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppTheme.primaryColor,
              onPrimary: Colors.white,
              surface: AppTheme.cardColor,
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        if (isFromDate) {
          _fromDate = picked;
        } else {
          _toDate = picked;
        }
      });
      _loadHoldings();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Holdings'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: AppTheme.primaryColor,
          labelColor: AppTheme.primaryColor,
          unselectedLabelColor: Colors.grey,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Share'),
            Tab(text: 'FD'),
            Tab(text: 'SIP'),
            Tab(text: 'Saving'),
            Tab(text: 'Gold'),
            Tab(text: 'Coin'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Summary Box
          _buildSummaryBox(),
          
          // Date Filter
          _buildDateFilter(),
          
          // Holdings List/Table
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _holdings.isEmpty
                    ? Center(
                        child: Text(
                          'No holdings found for $_selectedCategory',
                          style: const TextStyle(color: AppTheme.textSecondary),
                        ),
                      )
                    : _selectedCategory == 'All'
                        ? _buildAllReport()
                        : _buildCategoryReport(),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryBox() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primaryColor, AppTheme.greenAccent],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryColor.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildSummaryItem('Total Investment', _totalInvestment),
          Container(width: 1, height: 40, color: Colors.white.withOpacity(0.3)),
          _buildSummaryItem('Total Value', _totalValue),
          Container(width: 1, height: 40, color: Colors.white.withOpacity(0.3)),
          _buildSummaryItem('Total Profit', _totalProfit, isProfit: true),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, double amount, {bool isProfit = false}) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '₹${amount.toStringAsFixed(0)}',
          style: TextStyle(
            color: isProfit 
                ? (amount >= 0 ? Colors.lightGreenAccent : Colors.redAccent)
                : Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildDateFilter() {
    final dateFormat = DateFormat('dd/MM/yyyy');
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: AppTheme.cardColor,
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: () => _selectDate(context, true),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white.withOpacity(0.3)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 16, color: AppTheme.textSecondary),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'From Date',
                          style: TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 10,
                          ),
                        ),
                        Text(
                          dateFormat.format(_fromDate),
                          style: const TextStyle(
                            color: AppTheme.textPrimary,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: InkWell(
              onTap: () => _selectDate(context, false),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white.withOpacity(0.3)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 16, color: AppTheme.textSecondary),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'To Date',
                          style: TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 10,
                          ),
                        ),
                        Text(
                          dateFormat.format(_toDate),
                          style: const TextStyle(
                            color: AppTheme.textPrimary,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAllReport() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SingleChildScrollView(
        child: DataTable(
          headingRowColor: MaterialStateProperty.all(AppTheme.cardColor),
          dataRowColor: MaterialStateProperty.all(AppTheme.backgroundColor),
          columns: const [
            DataColumn(label: Text('Category', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Investment', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Value', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Profit', style: TextStyle(fontWeight: FontWeight.bold))),
          ],
          rows: _buildAllReportRows(),
        ),
      ),
    );
  }

  List<DataRow> _buildAllReportRows() {
    // Group by category
    Map<String, Map<String, double>> categoryTotals = {};
    
    for (var holding in _holdings) {
      String category = holding['category'];
      if (!categoryTotals.containsKey(category)) {
        categoryTotals[category] = {
          'investment': 0,
          'value': 0,
          'profit': 0,
        };
      }
      categoryTotals[category]!['investment'] = 
          (categoryTotals[category]!['investment'] ?? 0) + (holding['investment'] as double);
      categoryTotals[category]!['value'] = 
          (categoryTotals[category]!['value'] ?? 0) + (holding['value'] as double);
      categoryTotals[category]!['profit'] = 
          (categoryTotals[category]!['profit'] ?? 0) + (holding['profit'] as double);
    }

    return categoryTotals.entries.map((entry) {
      final profit = entry.value['profit']!;
      return DataRow(
        cells: [
          DataCell(Text(entry.key)),
          DataCell(Text('₹${entry.value['investment']!.toStringAsFixed(0)}')),
          DataCell(Text('₹${entry.value['value']!.toStringAsFixed(0)}')),
          DataCell(
            Text(
              '₹${profit.toStringAsFixed(0)}',
              style: TextStyle(
                color: profit >= 0 ? Colors.green : Colors.red,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      );
    }).toList();
  }

  Widget _buildCategoryReport() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SingleChildScrollView(
        child: DataTable(
          headingRowColor: MaterialStateProperty.all(AppTheme.cardColor),
          dataRowColor: MaterialStateProperty.all(AppTheme.backgroundColor),
          columns: const [
            DataColumn(label: Text('Scheme', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Investment', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Value', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Profit', style: TextStyle(fontWeight: FontWeight.bold))),
          ],
          rows: _holdings.map((holding) {
            final profit = holding['profit'] as double;
            return DataRow(
              cells: [
                DataCell(Text(holding['scheme'])),
                DataCell(Text('₹${(holding['investment'] as double).toStringAsFixed(0)}')),
                DataCell(Text('₹${(holding['value'] as double).toStringAsFixed(0)}')),
                DataCell(
                  Text(
                    '₹${profit.toStringAsFixed(0)}',
                    style: TextStyle(
                      color: profit >= 0 ? Colors.green : Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}
