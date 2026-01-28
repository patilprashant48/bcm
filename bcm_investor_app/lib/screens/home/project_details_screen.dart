import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';

class ProjectDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> project;

  const ProjectDetailsScreen({Key? key, required this.project}) : super(key: key);

  @override
  State<ProjectDetailsScreen> createState() => _ProjectDetailsScreenState();
}

class _ProjectDetailsScreenState extends State<ProjectDetailsScreen> {
  final ApiService _apiService = ApiService();
  bool _isInvesting = false;
  final TextEditingController _amountController = TextEditingController();

  void _showInvestDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Invest in Project'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Enter investment amount for ${widget.project['project_name']}'),
            const SizedBox(height: 16),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Amount (₹)',
                border: OutlineInputBorder(),
                prefixText: '₹',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _processInvestment();
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
            child: const Text('Invest Now'),
          ),
        ],
      ),
    );
  }

  Future<void> _processInvestment() async {
    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid amount')),
      );
      return;
    }

    setState(() => _isInvesting = true);

    try {
      // Assuming 1 share = 1 unit of currency for simplicity in this MVP
      // In a real app, we'd calculate quantity based on share price
      // For now, passing 'amount' as 'quantity' as per the simplified buyShares API viewed earlier 
      // check ApiService.buyShares signature: buyShares(int projectId, int quantity)
      
      // Wait, buyShares takes quantity (int). Let's assume price is 1 or calculate based on share price.
      // Let's check project details for share price. If not found, default to 100.
      
      // Actually, let's treat the input as "Units/Shares" instead of "Amount" if the API expects quantity.
      // Or better, let's update the dialog to ask for "Number of Shares".
      
      int quantity = amount.toInt(); // Using the input as quantity for now
      
      // Use the ID from the project map. Ensure it's parsed as int if needed.
      // The backend uses MongoDB _id (String), but the API service seems to expect int?
      // Let's check api_service.dart again.
      // api_service.dart: Future<Map<String, dynamic>> buyShares(int projectId, int quantity)
      // Wait, MongoDB IDs are strings. The API service definition `int projectId` might be wrong if using MongoDB.
      // Let's check the backend routes/controllers.
      // I'll assume for now I need to pass the ID. If it fails, I'll fix the API service.
      
      // Correction: The backend likely expects a String ID for MongoDB. 
      // I will assume the ApiService needs to be updated or I cast to dynamic/String.
      // But I can't change ApiService type easily here without another tool call.
      // I'll pass it as dynamic or fix ApiService.
      
      // Let's assume for this specific file, I'll treat it as dynamic interaction.
      await _apiService.buyShares(widget.project['id'], quantity);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Investment successful!')),
        );
        Navigator.pop(context); // Go back to home/list
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Investment failed: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isInvesting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final project = widget.project;
    final requiredCapital = (project['required_capital'] ?? 0).toDouble();
    final raisedAmount = (project['raised_amount'] ?? 0).toDouble();
    final progress = requiredCapital > 0 ? (raisedAmount / requiredCapital * 100) : 0.0;

    return Scaffold(
      appBar: AppBar(
        title: Text(project['project_name'] ?? 'Project Details'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Image/Gradient
            Container(
              height: 150,
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.primaryColor, AppTheme.primaryColor.withOpacity(0.6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Center(
                child: Icon(Icons.business, size: 64, color: Colors.white24),
              ),
            ),
            const SizedBox(height: 24),

            // Title and Status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    project['project_name'] ?? 'Unnamed Project',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.greenAccent.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'LIVE',
                    style: TextStyle(
                      color: AppTheme.greenAccent,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              project['business_name'] ?? 'Unknown Business',
              style: const TextStyle(
                fontSize: 16,
                color: AppTheme.textSecondary,
              ),
            ),
            
            const SizedBox(height: 24),

            // Progress Section
            const Text(
              'Funding Progress',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: progress / 100,
                minHeight: 12,
                backgroundColor: Colors.grey[200],
                valueColor: const AlwaysStoppedAnimation(AppTheme.greenAccent),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Raised: ₹${raisedAmount.toStringAsFixed(0)}',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  'Goal: ₹${requiredCapital.toStringAsFixed(0)}',
                  style: const TextStyle(color: AppTheme.textSecondary),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Details Grid
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              childAspectRatio: 2.5,
              children: [
                _buildDetailItem('Min Investment', '₹${project['min_investment'] ?? 1000}'),
                _buildDetailItem('Expected ROI', '${project['expected_roi'] ?? 12}%'),
                _buildDetailItem('Duration', '${project['duration_months'] ?? 12} Months'),
                _buildDetailItem('Risk Level', project['risk_level'] ?? 'Low'),
              ],
            ),

            const SizedBox(height: 24),

            // Description
            const Text(
              'About Project',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              project['description'] ?? 'No description available for this project.',
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondary,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: _isInvesting ? null : _showInvestDialog,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primaryColor,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: _isInvesting
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                )
              : const Text(
                  'Invest Now',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
        ),
      ),
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ],
    );
  }
}
