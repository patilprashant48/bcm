import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';

class TopUpScreen extends StatefulWidget {
  const TopUpScreen({Key? key}) : super(key: key);

  @override
  State<TopUpScreen> createState() => _TopUpScreenState();
}

class _TopUpScreenState extends State<TopUpScreen> {
  final ApiService _apiService = ApiService();
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _txnIdController = TextEditingController();
  
  Map<String, dynamic>? _paymentDetails;
  bool _isLoading = true;
  String _selectedMethod = 'UPI'; // UPI, BANK_TRANSFER, REQUESTS
  XFile? _selectedImage;
  bool _isSubmitting = false;
  List<dynamic> _requests = []; // List of payment requests

  @override
  void initState() {
    super.initState();
    _loadAllData();
  }

  Future<void> _loadAllData() async {
    await Future.wait([
      _loadPaymentDetails(),
      _loadRequests(),
    ]);
  }

  Future<void> _loadRequests() async {
    try {
      final requests = await _apiService.getPaymentRequests();
      if (mounted) {
        setState(() {
          _requests = requests;
        });
      }
    } catch (e) {
      print('Failed to load requests: $e');
    }
  }

  Future<void> _loadPaymentDetails() async {
    try {
      final details = await _apiService.getPaymentDetails();
      if (mounted) {
        setState(() {
          _paymentDetails = details;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        // Scoped snackbar or retry?
      }
    }
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        _selectedImage = image;
      });
    }
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload a screenshot')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await _apiService.topUpWallet(
        double.parse(_amountController.text),
        _selectedMethod, // UPI or BANK_TRANSFER
        _txnIdController.text,
        _selectedImage!.path,
      );

      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Text('Request Submitted'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 64),
                const SizedBox(height: 16),
                Text(
                  'Your Top-up request ₹${_amountController.text} is submitted successfully.',
                  textAlign: TextAlign.center,
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  // Clear form and switch to requests tab
                  _amountController.clear();
                  _txnIdController.clear();
                  setState(() {
                    _selectedImage = null;
                    _selectedMethod = 'REQUESTS';
                  });
                  _loadRequests(); // Refresh list
                },
                child: const Text('View Status'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'APPROVED': return Colors.green;
      case 'REJECTED': return Colors.red;
      case 'PENDING': return Colors.orange;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Top Up Wallet')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                   const SizedBox(height: 16),
                   Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: _buildMethodSelector(),
                   ),
                   const SizedBox(height: 16),

                   if (_selectedMethod == 'REQUESTS')
                      _buildRequestHistory()
                   else
                      Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildPaymentDetailsSection(),
                            const SizedBox(height: 24),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Request Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 16),
                                  TextFormField(
                                    controller: _amountController,
                                    keyboardType: TextInputType.number,
                                    style: const TextStyle(color: Colors.black),
                                    decoration: const InputDecoration(
                                      labelText: 'Amount',
                                      labelStyle: TextStyle(color: Colors.black54),
                                      prefixText: '₹',
                                      prefixStyle: TextStyle(color: Colors.black),
                                      border: OutlineInputBorder(),
                                      filled: true,
                                      fillColor: Colors.white,
                                    ),
                                    validator: (v) => (v == null || v.isEmpty || double.tryParse(v) == null) ? 'Enter valid amount' : null,
                                  ),
                                  const SizedBox(height: 16),
                                  TextFormField(
                                    controller: _txnIdController,
                                    style: const TextStyle(color: Colors.black),
                                    decoration: const InputDecoration(
                                      labelText: 'Transaction ID (Ref No./UTR)',
                                      labelStyle: TextStyle(color: Colors.black54),
                                      border: OutlineInputBorder(),
                                      filled: true,
                                      fillColor: Colors.white,
                                    ),
                                    validator: (v) => (v == null || v.isEmpty) ? 'Enter Transaction ID' : null,
                                  ),
                                  const SizedBox(height: 16),
                                  _buildScreenshotUpload(),
                                  const SizedBox(height: 32),
                                  SizedBox(
                                    width: double.infinity,
                                    height: 50,
                                    child: ElevatedButton(
                                      onPressed: _isSubmitting ? null : _submitRequest,
                                      child: _isSubmitting 
                                         ? const CircularProgressIndicator(color: Colors.white)
                                         : const Text('Submit Request'),
                                    ),
                                  ),
                                  const SizedBox(height: 32), 
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                ],
              ),
            ),
    );
  }

  Widget _buildMethodSelector() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(child: _buildTab('UPI', 'UPI')),
          const SizedBox(width: 4),
          Expanded(child: _buildTab('Bank Transfer', 'BANK_TRANSFER')),
          const SizedBox(width: 4),
          Expanded(child: _buildTab('Requests', 'REQUESTS')),
        ],
      ),
    );
  }

  Widget _buildTab(String label, String value) {
    final isSelected = _selectedMethod == value;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryColor : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black87,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ),
    );
  }

  Widget _buildRequestHistory() {
    if (_requests.isEmpty) {
      return Container(
        padding: const EdgeInsets.only(top: 100),
        alignment: Alignment.center,
        child: const Text('No Request History found.', style: TextStyle(color: Colors.grey)),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: Colors.grey.shade300)),
              ),
              child: const Row(
                children: [
                  Expanded(flex: 3, child: Text('Date', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black, fontSize: 12))),
                  Expanded(flex: 2, child: Text('Mode', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black, fontSize: 12))),
                  Expanded(flex: 3, child: Text('Amount', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black, fontSize: 12))),
                  Expanded(flex: 3, child: Text('Status', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black, fontSize: 12))),
                  Expanded(flex: 3, child: Text('Ref', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black, fontSize: 12))),
                ],
              ),
            ),
            const SizedBox(height: 8),
            // Items
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _requests.length,
              separatorBuilder: (_, __) => const Divider(height: 16),
              itemBuilder: (context, index) {
                final req = _requests[index];
                final status = (req['status'] ?? 'PENDING').toString().toUpperCase();
                String dateStr = req['createdAt'] ?? req['created_at'] ?? '';
                if (dateStr.length >= 10) dateStr = dateStr.substring(0, 10);

                return Row(
                  children: [
                    Expanded(flex: 3, child: Text(dateStr, style: const TextStyle(color: Colors.black87, fontSize: 11))),
                    Expanded(flex: 2, child: Text(req['paymentMethod'] ?? 'N/A', style: const TextStyle(color: Colors.black87, fontSize: 11))),
                    Expanded(flex: 3, child: Text('₹${req['amount'] ?? 0}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87, fontSize: 11))),
                    Expanded(flex: 3, child: Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                        decoration: BoxDecoration(
                          color: _getStatusColor(status).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: _getStatusColor(status)),
                        ),
                        child: Text(
                          status,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: _getStatusColor(status),
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    )),
                    Expanded(flex: 3, child: Text(req['transactionId'] ?? '-', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.black87, fontSize: 11))),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentDetailsSection() {
    if (_paymentDetails == null) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      color: Colors.grey[100],
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const Text(
            'Send Payment To',
            style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 16),
          if (_selectedMethod == 'UPI') ...[
            if (_paymentDetails!['company_qr_code_url'] != null)
               Container(
                 height: 180,
                 width: 180,
                 color: Colors.white,
                 padding: const EdgeInsets.all(8),
                 // Placeholder for actual image
                 child: Icon(Icons.qr_code_2, size: 160, color: Colors.black),
               ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                   Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                       const Text('UPI ID', style: TextStyle(fontSize: 12, color: Colors.black87)),
                       Text(_paymentDetails!['company_upi_id'] ?? 'N/A', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black)),
                     ],
                   ),
                   IconButton(
                     icon: const Icon(Icons.copy, color: Colors.black54),
                     onPressed: () {
                        Clipboard.setData(ClipboardData(text: _paymentDetails!['company_upi_id'] ?? ''));
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('UPI ID Copied')));
                     },
                   ),
                ],
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                 color: Colors.white,
                 borderRadius: BorderRadius.circular(8),
                 border: Border.all(color: Colors.grey.shade300),
              ),
              child: Column(
                children: [
                   _buildDetailRow('Bank Name', _paymentDetails!['company_bank_name']),
                   const Divider(),
                   _buildDetailRow('Account Number', _paymentDetails!['company_account_number'], isCopyable: true),
                   const Divider(),
                   _buildDetailRow('IFSC Code', _paymentDetails!['company_ifsc'], isCopyable: true),
                ],
              ),
            )
          ]
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String? value, {bool isCopyable = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.black87)),
          Row(
            children: [
              Text(value ?? 'N/A', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
              if (isCopyable)
                IconButton(
                  icon: const Icon(Icons.copy, size: 20, color: Colors.black54),
                  onPressed: () {
                     Clipboard.setData(ClipboardData(text: value ?? ''));
                     ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$label Copied')));
                  },
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  splashRadius: 20, 
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildScreenshotUpload() {
    return GestureDetector(
      onTap: _pickImage,
      child: Container(
        height: 150,
        width: double.infinity,
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey),
          borderRadius: BorderRadius.circular(12),
          color: Colors.grey[100],
        ),
        child: _selectedImage != null
            ? Stack(
                fit: StackFit.expand,
                children: [
                  Image.file(File(_selectedImage!.path), fit: BoxFit.cover),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: CircleAvatar(
                      backgroundColor: Colors.white,
                      child: IconButton(
                        icon: const Icon(Icons.edit, color: AppTheme.primaryColor),
                        onPressed: _pickImage,
                      ),
                    ),
                  ),
                ],
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.cloud_upload_outlined, size: 48, color: Colors.grey),
                  const SizedBox(height: 8),
                  const Text('Upload Payment Screenshot', style: TextStyle(color: Colors.grey)),
                ],
              ),
      ),
    );
  }
}
