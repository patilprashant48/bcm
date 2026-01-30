import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../config/theme.dart';
import '../account/bank_details_screen.dart';

class WithdrawalScreen extends StatefulWidget {
  final double availableBalance;

  const WithdrawalScreen({Key? key, required this.availableBalance}) : super(key: key);

  @override
  State<WithdrawalScreen> createState() => _WithdrawalScreenState();
}

class _WithdrawalScreenState extends State<WithdrawalScreen> {
  final ApiService _apiService = ApiService();
  final _amountController = TextEditingController();
  
  Map<String, dynamic>? _bankDetails;
  bool _isLoading = true;
  String _selectedMethod = 'BANK_TRANSFER';
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadBankDetails();
  }

  Future<void> _loadBankDetails() async {
    try {
      final details = await _apiService.getBankDetails();
      setState(() {
        _bankDetails = details;
        _isLoading = false;
        // Default to UPI if available and populated, else Bank
        if (details['upiId'] != null && details['upiId'].isNotEmpty) {
           _selectedMethod = 'UPI';
        }
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  bool _hasBankDetails() {
    if (_bankDetails == null) return false;
    final b = _bankDetails!;
    return (b['bankAccountNumber']?.isNotEmpty ?? false) && (b['bankIfsc']?.isNotEmpty ?? false);
  }

  bool _hasUpi() {
    if (_bankDetails == null) return false;
    return _bankDetails!['upiId']?.isNotEmpty ?? false;
  }

  Future<void> _submitRequest() async {
    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invalid Amount')));
      return;
    }

    if (amount > widget.availableBalance) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Insufficient Wallet Balance')));
      return;
    }

    if ((_selectedMethod == 'BANK_TRANSFER' && !_hasBankDetails()) || 
        (_selectedMethod == 'UPI' && !_hasUpi())) {
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please update selected payment method details in Settings')));
       return;
    }

    setState(() => _isSubmitting = true);

    try {
      // Send snapshot of current bank details to ensure admin pays to right place even if user changes it later
      await _apiService.requestWithdrawal(
        amount,
        _selectedMethod,
        _bankDetails!,
      );

      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Text('Withdrawal Requested'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 60),
                const SizedBox(height: 16),
                const Text('Your request is PENDING approval.'),
                const SizedBox(height: 8),
                const Text('Admin will upload proof upon transfer.', style: TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Withdraw Funds')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Container(
                     padding: const EdgeInsets.all(16),
                     decoration: BoxDecoration(
                       color: AppTheme.greenAccent.withOpacity(0.1),
                       borderRadius: BorderRadius.circular(12),
                       border: Border.all(color: AppTheme.greenAccent),
                     ),
                     child: Row(
                       mainAxisAlignment: MainAxisAlignment.spaceBetween,
                       children: [
                         const Text('Available Balance', style: TextStyle(fontSize: 16)),
                         Text('₹${widget.availableBalance.toStringAsFixed(2)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.greenAccent)),
                       ],
                     ),
                   ),
                   const SizedBox(height: 24),
                   
                   const Text('Withdraw To', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                   const SizedBox(height: 12),
                   
                   _buildMethodSelector(),
                   
                   const SizedBox(height: 24),
                   _buildDetailsPreview(),
                   
                   const SizedBox(height: 12),
                   Center(
                     child: TextButton.icon(
                       icon: const Icon(Icons.edit),
                       label: const Text('Update Bank Details'),
                       onPressed: () {
                         Navigator.push(
                           context,
                           MaterialPageRoute(builder: (context) => const BankDetailsScreen()),
                         ).then((_) => _loadBankDetails()); // Reload on return
                       },
                     ),
                   ),

                   const SizedBox(height: 32),
                   TextField(
                     controller: _amountController,
                     keyboardType: TextInputType.number,
                     decoration: const InputDecoration(
                       labelText: 'Withdrawal Amount',
                       prefixText: '₹',
                       border: OutlineInputBorder(),
                     ),
                   ),
                   const SizedBox(height: 32),
                   
                   SizedBox(
                     width: double.infinity,
                     height: 50,
                     child: ElevatedButton(
                       onPressed: _isSubmitting ? null : _submitRequest,
                       style: ElevatedButton.styleFrom(backgroundColor: AppTheme.greenAccent),
                       child: _isSubmitting ? const CircularProgressIndicator(color: Colors.white) : const Text('Submit Request'),
                     ),
                   ),
                ],
              ),
            ),
    );
  }

  Widget _buildMethodSelector() {
    return Row(
      children: [
        Expanded(child: _buildChoiceChip('Bank Transfer', 'BANK_TRANSFER', _hasBankDetails())),
        const SizedBox(width: 12),
        Expanded(child: _buildChoiceChip('UPI', 'UPI', _hasUpi())),
      ],
    );
  }

  Widget _buildChoiceChip(String label, String value, bool isConfigured) {
    bool isSelected = _selectedMethod == value;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedMethod = value);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.greenAccent : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSelected ? AppTheme.greenAccent : Colors.grey),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.black87,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (!isConfigured)
              const Text('(Not Setup)', style: TextStyle(color: Colors.red, fontSize: 10))
          ],
        ),
      ),
    );
  }

  Widget _buildDetailsPreview() {
    if (_bankDetails == null) return const SizedBox.shrink();

    if (_selectedMethod == 'UPI') {
       if (!_hasUpi()) {
         return const Text('No UPI ID configured.', style: TextStyle(color: Colors.red));
       }
       return ListTile(
         leading: const Icon(Icons.qr_code, size: 32),
         title: Text(_bankDetails!['upiId']),
         subtitle: const Text('UPI ID'),
         tileColor: Colors.grey[100],
         shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
       );
    } else {
       if (!_hasBankDetails()) {
          return const Text('No Bank Account configured.', style: TextStyle(color: Colors.red));
       }
       return Container(
         padding: const EdgeInsets.all(12),
         decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(8)),
         child: Column(
           crossAxisAlignment: CrossAxisAlignment.start,
           children: [
             Text(_bankDetails!['bankName'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
             const SizedBox(height: 4),
             Text('A/C: ${_bankDetails!['bankAccountNumber'] ?? ''}'),
             Text('IFSC: ${_bankDetails!['bankIfsc'] ?? ''}'),
           ],
         ),
       );
    }
  }
}
