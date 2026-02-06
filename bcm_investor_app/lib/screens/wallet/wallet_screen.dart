import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../config/theme.dart';
import 'top_up_screen.dart';
import 'withdrawal_screen.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({Key? key}) : super(key: key);

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _wallet;
  List<dynamic> _transactions = [];
  List<dynamic> _requests = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadWalletData();
  }

  Future<void> _loadWalletData() async {
    try {
      final wallet = await _apiService.getWallet();
      final transactions = await _apiService.getTransactions();
      final requests = await _apiService.getPaymentRequests();
      
      setState(() {
        _wallet = wallet;
        _transactions = transactions;
        _requests = requests;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // Show top-up dialog
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const TopUpScreen()),
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadWalletData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Balance Card
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppTheme.primaryColor,
                            AppTheme.primaryColor.withOpacity(0.7),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Available Balance',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '₹${(_wallet?['balance'] ?? 0).toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 40,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (context) => const TopUpScreen()),
                                    );
                                  },
                                  icon: const Icon(Icons.add),
                                  label: const Text('Top Up'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    foregroundColor: AppTheme.primaryColor,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (context) => WithdrawalScreen(availableBalance: (_wallet?['balance'] ?? 0).toDouble())),
                                    );
                                  },
                                  icon: const Icon(Icons.remove),
                                  label: const Text('Withdraw'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.white,
                                    side: const BorderSide(color: Colors.white),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    const SizedBox(height: 24),

                    // Pending Requests Section
                    if (_requests.isNotEmpty) ...[
                      const Text(
                        'Payment Requests',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        decoration: BoxDecoration(
                          color: AppTheme.cardColor,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white10),
                        ),
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: DataTable(
                            headingRowColor: MaterialStateProperty.all(Colors.white.withOpacity(0.05)),
                            columns: const [
                              DataColumn(label: Text('Date', style: TextStyle(color: AppTheme.textSecondary))),
                              DataColumn(label: Text('Mode', style: TextStyle(color: AppTheme.textSecondary))),
                              DataColumn(label: Text('Amount', style: TextStyle(color: AppTheme.textSecondary))),
                              DataColumn(label: Text('Status', style: TextStyle(color: AppTheme.textSecondary))),
                              DataColumn(label: Text('Details', style: TextStyle(color: AppTheme.textSecondary))),
                            ],
                            rows: _requests.map((req) {
                              Color statusColor = Colors.orange;
                              final status = req['status'] ?? 'PENDING';
                              if (status == 'APPROVED') statusColor = Colors.green;
                              if (status == 'REJECTED') statusColor = Colors.red;
                              
                              String dateStr = req['createdAt'] ?? req['created_at'] ?? '';
                              if (dateStr.length >= 10) dateStr = dateStr.substring(0, 10);

                              return DataRow(
                                cells: [
                                  DataCell(Text(
                                    dateStr,
                                    style: const TextStyle(color: AppTheme.textPrimary),
                                  )),
                                  DataCell(Text(
                                    req['paymentMethod'] ?? 'N/A',
                                    style: const TextStyle(color: AppTheme.textPrimary),
                                  )),
                                  DataCell(Text(
                                    '₹${req['amount'] ?? 0}',
                                    style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold),
                                  )),
                                  DataCell(Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: statusColor.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: statusColor.withOpacity(0.5)),
                                    ),
                                    child: Text(
                                      status,
                                      style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold),
                                    ),
                                  )),
                                  DataCell(Text(
                                    req['transactionId'] ?? '-',
                                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                                  )),
                                ],
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                    
                    // Transactions
                    const Text(
                      'Recent Transactions',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    
                    if (_transactions.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: Text(
                            'No transactions yet',
                            style: TextStyle(color: AppTheme.textSecondary),
                          ),
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _transactions.length,
                        itemBuilder: (context, index) {
                          final txn = _transactions[index];
                          final isCredit = txn['type'] == 'CREDIT' || txn['type'] == 'DEPOSIT';
                          
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: isCredit 
                                      ? AppTheme.greenAccent.withOpacity(0.2)
                                      : AppTheme.redAccent.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                                  color: isCredit ? AppTheme.greenAccent : AppTheme.redAccent,
                                ),
                              ),
                              title: Text(
                                txn['description'] ?? 'Transaction',
                                style: const TextStyle(
                                  color: AppTheme.textPrimary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              subtitle: Text(
                                (txn['createdAt'] ?? txn['created_at'] ?? '').toString().length >= 16 
                                  ? (txn['createdAt'] ?? txn['created_at']).toString().substring(0, 16)
                                  : (txn['createdAt'] ?? txn['created_at'] ?? 'N/A'),
                                style: const TextStyle(
                                  color: AppTheme.textSecondary,
                                  fontSize: 12,
                                ),
                              ),
                              trailing: Text(
                                '${isCredit ? '+' : '-'}₹${(txn['amount'] ?? 0).toStringAsFixed(2)}',
                                style: TextStyle(
                                  color: isCredit ? AppTheme.greenAccent : AppTheme.redAccent,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ),
    );
  }
}
