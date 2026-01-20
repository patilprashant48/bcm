import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../config/theme.dart';

class PortfolioScreen extends StatefulWidget {
  const PortfolioScreen({Key? key}) : super(key: key);

  @override
  State<PortfolioScreen> createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _investments = [];
  bool _isLoading = true;
  double _totalInvested = 0;
  double _currentValue = 0;

  @override
  void initState() {
    super.initState();
    _loadInvestments();
  }

  Future<void> _loadInvestments() async {
    try {
      final investments = await _apiService.getMyInvestments();
      
      double invested = 0;
      double current = 0;
      for (var inv in investments) {
        invested += (inv['invested_amount'] ?? 0);
        current += (inv['current_value'] ?? inv['invested_amount'] ?? 0);
      }
      
      setState(() {
        _investments = investments;
        _totalInvested = invested;
        _currentValue = current;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pnl = _currentValue - _totalInvested;
    final pnlPercentage = _totalInvested > 0 ? (pnl / _totalInvested * 100) : 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Portfolio'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadInvestments,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Portfolio Summary Card
                    Container(
                      padding: const EdgeInsets.all(20),
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
                            'Total Portfolio Value',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '₹${_currentValue.toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Invested',
                                      style: TextStyle(color: Colors.white70, fontSize: 12),
                                    ),
                                    Text(
                                      '₹${_totalInvested.toStringAsFixed(2)}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'P&L',
                                      style: TextStyle(color: Colors.white70, fontSize: 12),
                                    ),
                                    Text(
                                      '${pnl >= 0 ? '+' : ''}₹${pnl.toStringAsFixed(2)} (${pnlPercentage.toStringAsFixed(2)}%)',
                                      style: TextStyle(
                                        color: pnl >= 0 ? AppTheme.greenAccent : AppTheme.redAccent,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Holdings
                    const Text(
                      'My Holdings',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    
                    if (_investments.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: Text(
                            'No investments yet',
                            style: TextStyle(color: AppTheme.textSecondary),
                          ),
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _investments.length,
                        itemBuilder: (context, index) {
                          final investment = _investments[index];
                          final invPnl = (investment['current_value'] ?? investment['invested_amount']) - 
                                        (investment['invested_amount'] ?? 0);
                          
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    investment['project_name'] ?? 'Investment',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text(
                                            'Invested',
                                            style: TextStyle(
                                              color: AppTheme.textSecondary,
                                              fontSize: 12,
                                            ),
                                          ),
                                          Text(
                                            '₹${(investment['invested_amount'] ?? 0).toStringAsFixed(2)}',
                                            style: const TextStyle(
                                              color: AppTheme.textPrimary,
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.end,
                                        children: [
                                          const Text(
                                            'Current',
                                            style: TextStyle(
                                              color: AppTheme.textSecondary,
                                              fontSize: 12,
                                            ),
                                          ),
                                          Text(
                                            '₹${(investment['current_value'] ?? investment['invested_amount'] ?? 0).toStringAsFixed(2)}',
                                            style: TextStyle(
                                              color: invPnl >= 0 ? AppTheme.greenAccent : AppTheme.redAccent,
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
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
