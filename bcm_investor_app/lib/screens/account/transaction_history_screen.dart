import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';
import 'package:intl/intl.dart';

class TransactionHistoryScreen extends StatefulWidget {
  final String? filterType; // 'CREDIT' or 'DEBIT' or null
  final DateTime? fromDate;
  final DateTime? toDate;
  
  const TransactionHistoryScreen({
    Key? key, 
    this.filterType,
    this.fromDate,
    this.toDate,
  }) : super(key: key);

  @override
  State<TransactionHistoryScreen> createState() => _TransactionHistoryScreenState();
}

class _TransactionHistoryScreenState extends State<TransactionHistoryScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _allTransactions = [];
  String? _error;
  String? _quickFilter; // TODAY_BUY, TODAY_SELL, TODAY_TOPUP, TODAY_WITHDRAWAL

  @override
  void initState() {
    super.initState();
    _loadTransactions();
  }

  Future<void> _loadTransactions() async {
    try {
      final transactions = await _apiService.getTransactions();
      
      List<dynamic> filtered = transactions;
      if (widget.filterType != null) {
        // Handle both 'type' and 'entryType' field names
        filtered = transactions.where((t) {
          final txType = t['entryType'] ?? t['type'];
          return txType == widget.filterType;
        }).toList();
      }
      
      // Filter by date range if provided
      if (widget.fromDate != null && widget.toDate != null) {
        filtered = filtered.where((t) {
          try {
            final txDate = DateTime.parse(t['created_at'] ?? t['createdAt'] ?? '');
            final fromMidnight = DateTime(widget.fromDate!.year, widget.fromDate!.month, widget.fromDate!.day);
            final toMidnight = DateTime(widget.toDate!.year, widget.toDate!.month, widget.toDate!.day, 23, 59, 59);
            return txDate.isAfter(fromMidnight.subtract(const Duration(seconds: 1))) && 
                   txDate.isBefore(toMidnight.add(const Duration(seconds: 1)));
          } catch (e) {
            return false;
          }
        }).toList();
      }

      if (mounted) {
        setState(() {
          _allTransactions = filtered;
          _isLoading = false;
          _error = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString().replaceAll('Exception: ', '');
          _isLoading = false;
        });
      }
    }
  }

  List<dynamic> get _displayedTransactions {
    if (_quickFilter == null) return _allTransactions;

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    return _allTransactions.where((t) {
      // Date Check (Must be Today)
      final dateStr = t['created_at'] ?? t['createdAt'];
      if (dateStr == null) return false;
      
      try {
        final txDate = DateTime.parse(dateStr).toLocal();
        final txDay = DateTime(txDate.year, txDate.month, txDate.day);
        if (txDay != today) return false;
      } catch (e) {
        return false;
      }

      final type = (t['entryType'] ?? t['type'] ?? '').toString().toUpperCase();
      final ref = (t['referenceType'] ?? '').toString().toUpperCase();
      final desc = (t['description'] ?? '').toString().toLowerCase();

      switch (_quickFilter) {
        case 'TODAY_BUY':
          // Debit + Investment
          return type == 'DEBIT' && (ref == 'INVESTMENT' || desc.contains('buy') || desc.contains('invest'));
        case 'TODAY_SELL':
           // Credit + Investment/Return
          return type == 'CREDIT' && (ref == 'INVESTMENT' || ref == 'RETURN' || desc.contains('sell'));
        case 'TODAY_TOPUP':
           // Credit + Topup
          return type == 'CREDIT' && (ref == 'TOPUP');
        case 'TODAY_WITHDRAWAL':
           // Debit + Payout/Withdrawal
          return type == 'DEBIT' && (ref == 'PAYOUT' || ref == 'WITHDRAWAL');
        default:
          return true;
      }
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    String title = 'Transaction History';
    if (widget.filterType == 'CREDIT') title = 'Top Up History';
    if (widget.filterType == 'DEBIT') title = 'Withdrawal History';

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
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
                      Text(
                        _error!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: AppTheme.textSecondary),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _isLoading = true;
                            _error = null;
                          });
                          _loadTransactions();
                        },
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    // Quick Filter Dropdown (Only if no external filter type)
                    if (widget.filterType == null)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor, // Using Primary Color (Blue) instead of Green to match theme, or could use Green per screenshot
                          borderRadius: const BorderRadius.only(
                            bottomLeft: Radius.circular(20),
                            bottomRight: Radius.circular(20),
                          ),
                        ),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _quickFilter,
                              hint: const Text(
                                'Select Filter',
                                style: TextStyle(color: Colors.white),
                              ),
                              dropdownColor: AppTheme.primaryColor,
                              icon: const Icon(Icons.filter_list, color: Colors.white),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              isExpanded: true,
                              items: const [
                                DropdownMenuItem(value: null, child: Text('All Transactions')),
                                DropdownMenuItem(value: 'TODAY_BUY', child: Text("Today's Buy")),
                                DropdownMenuItem(value: 'TODAY_SELL', child: Text("Today's Selling")),
                                DropdownMenuItem(value: 'TODAY_TOPUP', child: Text("Today's Top Up")),
                                DropdownMenuItem(value: 'TODAY_WITHDRAWAL', child: Text("Today's Withdrawal")),
                              ],
                              onChanged: (val) {
                                setState(() => _quickFilter = val);
                              },
                            ),
                          ),
                        ),
                      ),
                    
                    // Transaction List
                    Expanded(
                      child: _displayedTransactions.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.receipt_long, size: 64, color: Colors.grey[300]),
                                  const SizedBox(height: 16),
                                  Text(
                                    widget.filterType == null
                                        ? 'No transactions found'
                                        : 'No ${title.toLowerCase()} yet',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      color: AppTheme.textSecondary,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _displayedTransactions.length,
                              itemBuilder: (context, index) {
                                final transaction = _displayedTransactions[index];
                                final txType = transaction['entryType'] ?? transaction['type'];
                                final isCredit = txType == 'CREDIT' || txType == 'DEPOSIT';
                                final amount = (transaction['amount'] ?? 0).toDouble();
                                final dateStr = transaction['createdAt'] ?? transaction['created_at'];
                                final date = DateTime.parse(dateStr);
                                
                                return Card(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  child: ListTile(
                                    leading: Container(
                                      width: 48,
                                      height: 48,
                                      decoration: BoxDecoration(
                                        color: (isCredit ? Colors.green : Colors.red).withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Icon(
                                        isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                                        color: isCredit ? Colors.green : Colors.red,
                                      ),
                                    ),
                                    title: Text(
                                      transaction['description'] ?? 'Transaction',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                    subtitle: Text(
                                      DateFormat('MMM d, yyyy • h:mm a').format(date.toLocal()),
                                      style: const TextStyle(
                                        color: AppTheme.textSecondary,
                                        fontSize: 12,
                                      ),
                                    ),
                                    trailing: Text(
                                      '${isCredit ? '+' : '-'}₹${amount.toStringAsFixed(2)}',
                                      style: TextStyle(
                                        color: isCredit ? Colors.green : Colors.red,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                    ),
                  ],
                ),
    );
  }
}
