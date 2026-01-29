import 'package:flutter/material.dart';
import '../../config/theme.dart';

class WatchlistScreen extends StatelessWidget {
  const WatchlistScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Mock data for watchlist
    final List<Map<String, dynamic>> watchlist = [
      {
        'project_name': 'Green Energy Solar Park',
        'business_name': 'EcoPower Ltd.',
        'required_capital': 5000000,
        'raised_amount': 3500000,
        'expected_roi': 15,
        'min_investment': 5000,
      },
      {
        'project_name': 'TechHub Expansion',
        'business_name': 'Innovate ch.',
        'required_capital': 2000000,
        'raised_amount': 200000,
        'expected_roi': 18,
        'min_investment': 10000,
      }
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Watchlist')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: watchlist.length,
        itemBuilder: (context, index) {
           final project = watchlist[index];
           // Reusing Project Card layout manually since we don't want to import the widget if it expects specific API structure?
           // Actually better to use the Widget if possible, but let's build a simple custom card for watchlist to avoid issues.
           
           return Card(
             margin: const EdgeInsets.only(bottom: 12),
             child: ListTile(
               contentPadding: const EdgeInsets.all(16),
               title: Text(
                 project['project_name'], 
                 style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textPrimary)
               ),
               subtitle: Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   const SizedBox(height: 4),
                   Text(project['business_name'], style: const TextStyle(color: AppTheme.textSecondary)),
                   const SizedBox(height: 8),
                   Row(
                     children: [
                       Text('ROI: ${project['expected_roi']}%', style: const TextStyle(color: AppTheme.greenAccent, fontWeight: FontWeight.bold)),
                       const SizedBox(width: 16),
                       Text('Min: ₹${project['min_investment']}', style: const TextStyle(color: AppTheme.textSecondary)),
                     ],
                   )
                 ],
               ),
               trailing: IconButton(
                 icon: const Icon(Icons.delete_outline, color: Colors.grey),
                 onPressed: () {
                    // Logic to remove
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Removed from watchlist')));
                 },
               ),
             ),
           );
        },
      ),
    );
  }
}
