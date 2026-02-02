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
  double _currentInvestment = 0;
  bool _isLoading = true;
  List<dynamic> _otherProjects = [];

  @override
  void initState() {
    super.initState();
    _loadAdditionalData();
  }

  Future<void> _loadAdditionalData() async {
    try {
      final investments = await _apiService.getMyInvestments();
      // Calculate total investment in this project
      // Note: investments API returns array. We need to filter by project_id
      double myTotal = 0;
      for (var inv in investments) {
        if (inv['project_id'].toString() == widget.project['_id'].toString() || 
            inv['project_id'].toString() == widget.project['id'].toString()) {
           // Provide fallback for amount field name if standard 'amount' is different
           myTotal += (inv['investmentAmount'] ?? inv['amount'] ?? 0).toDouble();
        }
      }

      // Fetch other projects for "All Live Projects" section if needed
      // Ideally we pass this list or fetch it. For now, we'll fetch all.
      final allProjects = await _apiService.getProjects();
      final others = allProjects.where((p) => p['_id'].toString() != widget.project['_id'].toString()).toList();

      if (mounted) {
        setState(() {
          _currentInvestment = myTotal;
          _otherProjects = others;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
      print('Failed to load additional data: $e');
    }
  }

  void _showInvestDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Invest in Project'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Enter number of shares/units for ${widget.project['project_name']}'),
            const SizedBox(height: 16),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Quantity',
                border: OutlineInputBorder(),
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
    final quantity = int.tryParse(_amountController.text);
    if (quantity == null || quantity <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid quantity')),
      );
      return;
    }

    setState(() => _isInvesting = true);

    try {
      await _apiService.buyShares(widget.project['_id'] ?? widget.project['id'], quantity);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Investment successful!')),
        );
        _loadAdditionalData(); // Reload to update Current Investment
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
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Project Header (Image placeholder)
              Container(
                height: 180,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(16),
                  image: const DecorationImage(
                     image: NetworkImage('https://placeholder.com/project-image.jpg'), // Placeholder or project['image_url']
                     fit: BoxFit.cover,
                  ),
                ),
                alignment: Alignment.bottomLeft,
                child: Container(
                   width: double.infinity,
                   padding: const EdgeInsets.all(16),
                   decoration: BoxDecoration(
                     gradient: LinearGradient(
                       colors: [Colors.black.withOpacity(0.8), Colors.transparent],
                       begin: Alignment.bottomCenter,
                       end: Alignment.topCenter,
                     ),
                     borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
                   ),
                   child: Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     mainAxisSize: MainAxisSize.min,
                     children: [
                       Text(
                         project['project_name'] ?? 'Unnamed Project',
                         style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                       ),
                       Row(
                         children: [
                           const Icon(Icons.location_on, color: Colors.white70, size: 16),
                           const SizedBox(width: 4),
                           Text(project['location'] ?? 'Location N/A', style: const TextStyle(color: Colors.white, fontSize: 14)),
                         ],
                       )
                     ],
                   ),
                ),
              ),
              
              const SizedBox(height: 24),

              // Current Investment Card
              if (_currentInvestment > 0)
                Container(
                  margin: const EdgeInsets.only(bottom: 24),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.greenAccent.withOpacity(0.1),
                    border: Border.all(color: AppTheme.greenAccent),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Your Current Investment', style: TextStyle(color: AppTheme.textSecondary)),
                          const SizedBox(height: 4),
                          Text('₹${_currentInvestment.toStringAsFixed(2)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.greenAccent)),
                        ],
                      ),
                      const Icon(Icons.check_circle, color: AppTheme.greenAccent, size: 32),
                    ],
                  ),
                ),

              // Company Profile Section
              const Text('Company Profile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                      child: Text(
                        (project['business_name'] ?? 'C')[0],
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(project['business_name'] ?? 'Company Name', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          const Text('Verified Business Partner', style: TextStyle(color: AppTheme.greenAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                           Text(project['business_description'] ?? 'Leading innovator in the sector.', 
                             style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                             maxLines: 2,
                             overflow: TextOverflow.ellipsis,
                           ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              
              // Project Details Grid
              const Text('Project Highlights', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                childAspectRatio: 2.5,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                children: [
                  _buildDetailItem('Target Raise', '₹${(requiredCapital / 100000).toStringAsFixed(1)}L'),
                  _buildDetailItem('Min Investment', '₹${project['min_investment'] ?? 1000}'),
                  _buildDetailItem('Expected ROI', '${project['expected_roi'] ?? 12}%'),
                  _buildDetailItem('Risk Level', project['risk_level'] ?? 'Medium'),
                  _buildDetailItem('Duration', '${project['duration_months'] ?? 12} Months'),
                   _buildDetailItem('Category', project['category'] ?? 'General'),
                ],
              ),

               const SizedBox(height: 24),

               // Description
               const Text('About Project', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
               const SizedBox(height: 8),
               Text(
                 project['description'] ?? 'No description provided.',
                 style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary, height: 1.5),
               ),
               
               const SizedBox(height: 32),
               
               // Other Live Projects
               if (_otherProjects.isNotEmpty) ...[
                 Row(
                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
                   children: [
                     const Text('Other Live Projects', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                     TextButton(onPressed: (){}, child: const Text('See All')),
                   ],
                 ),
                 const SizedBox(height: 12),
                 SizedBox(
                   height: 160,
                   child: ListView.builder(
                     scrollDirection: Axis.horizontal,
                     itemCount: _otherProjects.length,
                     itemBuilder: (context, index) {
                       final other = _otherProjects[index];
                       return Container(
                         width: 250,
                         margin: const EdgeInsets.only(right: 12),
                         padding: const EdgeInsets.all(12),
                         decoration: BoxDecoration(
                           color: Colors.white,
                           borderRadius: BorderRadius.circular(12),
                           border: Border.all(color: Colors.grey[200]!),
                         ),
                         child: Column(
                           crossAxisAlignment: CrossAxisAlignment.start,
                           children: [
                             Text(other['project_name'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis,
                               style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                             const SizedBox(height: 4),
                             Text(other['business_name'] ?? '', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                             const Spacer(),
                             Row(
                               mainAxisAlignment: MainAxisAlignment.spaceBetween,
                               children: [
                                 Text('ROI: ${other['expected_roi'] ?? 0}%', style: const TextStyle(color: AppTheme.greenAccent, fontWeight: FontWeight.bold)),
                                 ElevatedButton(
                                   onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(builder: (context) => ProjectDetailsScreen(project: other)),
                                      );
                                   },
                                   style: ElevatedButton.styleFrom(
                                     backgroundColor: AppTheme.primaryColor,
                                     padding: const EdgeInsets.symmetric(horizontal: 16),
                                     minimumSize: const Size(0, 30),
                                   ),
                                   child: const Text('View', style: TextStyle(fontSize: 12)),
                                 )
                               ],
                             )
                           ],
                         ),
                       );
                     },
                   ),
                 ),
                 const SizedBox(height: 80), // Space for FAB/Bottom Bar
               ],
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
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!),
      ),
      padding: const EdgeInsets.all(8),
      child: Column(
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
              fontSize: 15,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
