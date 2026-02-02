import 'dart:io';
import 'package:flutter/material.dart';

import 'package:image_picker/image_picker.dart';
import 'package:flutter/services.dart';
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
  String _selectedMethod = 'UPI'; // UPI or BANK_TRANSFER
  XFile? _selectedImage;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadPaymentDetails();
  }

  Future<void> _loadPaymentDetails() async {
    try {
      final details = await _apiService.getPaymentDetails();
      setState(() {
        _paymentDetails = details;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Failed to load payment details: $e')),
        );
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
        _selectedMethod,
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
                const Text('Your top-up request is PENDING. It will be processed after admin approval.'),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Go back to wallet/home
                },
                child: const Text('OK'),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Top Up Wallet')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildMethodSelector(),
                    const SizedBox(height: 24),
                    _buildPaymentDetailsCard(),
                    const SizedBox(height: 24),
                    const Text('Request Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _amountController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Amount',
                        prefixText: '₹',
                        border: OutlineInputBorder(),
                        filled: true,
                        fillColor: Colors.white,
                      ),
                      validator: (v) => (v == null || v.isEmpty || double.tryParse(v) == null) ? 'Enter valid amount' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _txnIdController,
                      decoration: const InputDecoration(
                        labelText: 'Transaction ID (Ref No./UTR)',
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
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildMethodSelector() {
    return Row(
      children: [
        Expanded(
          child: _buildChoiceChip('UPI', 'UPI'),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildChoiceChip('Bank Transfer', 'BANK_TRANSFER'),
        ),
      ],
    );
  }

  Widget _buildChoiceChip(String label, String value) {
    final isSelected = _selectedMethod == value;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryColor : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSelected ? AppTheme.primaryColor : Colors.grey),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black87,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentDetailsCard() {
    if (_paymentDetails == null) return const SizedBox.shrink();

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(
              'Send Payment To',
              style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (_selectedMethod == 'UPI') ...[
              if (_paymentDetails!['company_qr_code_url'] != null)
                 // Placeholder for QR code since we might not have a real URL image that works without network config
                 // Using an icon placeholder or network image with error builder
                 Container(
                   height: 150,
                   width: 150,
                   color: Colors.grey[200],
                   child: const Icon(Icons.qr_code_2, size: 100, color: Colors.black),
                 ),
              const SizedBox(height: 16),
              ListTile(
                title: const Text('UPI ID'),
                subtitle: Text(_paymentDetails!['company_upi_id'] ?? 'N/A', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                trailing: IconButton(
                  icon: const Icon(Icons.copy),
                  onPressed: () {
                     Clipboard.setData(ClipboardData(text: _paymentDetails!['company_upi_id'] ?? ''));
                     ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('UPI ID Copied')));
                  },
                ),
              ),
            ] else ...[
              _buildDetailRow('Bank Name', _paymentDetails!['company_bank_name']),
              const Divider(),
              _buildDetailRow('Account Number', _paymentDetails!['company_account_number'], isCopyable: true),
              const Divider(),
              _buildDetailRow('IFSC Code', _paymentDetails!['company_ifsc'], isCopyable: true),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String? value, {bool isCopyable = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textSecondary)),
          Row(
            children: [
              Text(value ?? 'N/A', style: const TextStyle(fontWeight: FontWeight.bold)),
              if (isCopyable)
                IconButton(
                  icon: const Icon(Icons.copy, size: 20),
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
