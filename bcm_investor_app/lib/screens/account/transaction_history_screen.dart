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
  List<dynamic> _transactions = [];
  String? _error;

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

      setState(() {
        _transactions = filtered;
        _isLoading = false;
        _error = null;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
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
              : _transactions.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.receipt_long, size: 64, color: Colors.grey[300]),
                          const SizedBox(height: 16),
                          Text(
                            widget.filterType == null
                                ? 'No transactions yet'
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
                      itemCount: _transactions.length,
                      itemBuilder: (context, index) {
                        final transaction = _transactions[index];
                        // Handle both 'type' and 'entryType' field names
                        final txType = transaction['entryType'] ?? transaction['type'];
                        final isCredit = txType == 'CREDIT' || txType == 'DEPOSIT';
                        final amount = (transaction['amount'] ?? 0).toDouble();
                        // Handle both 'createdAt' and 'created_at' field names
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
    );
  }
}
