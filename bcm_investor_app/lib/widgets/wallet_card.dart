import 'package:flutter/material.dart';

class WalletCard extends StatelessWidget {
  final String title;
  final double balance;
  final IconData icon;
  final Color color;

  final VoidCallback? onTopUp;
  final VoidCallback? onWithdraw;
  final bool showTopUp;
  final bool showWithdraw;
  final VoidCallback? onTap;

  const WalletCard({
    Key? key,
    required this.title,
    required this.balance,
    required this.icon,
    required this.color,
    this.onTap,
    this.onTopUp,
    this.onWithdraw,
    this.showTopUp = false,
    this.showWithdraw = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [color, color.withOpacity(0.7)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Flexible(
                  child: Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Icon(icon, color: Colors.white, size: 20),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '₹${balance.toStringAsFixed(2)}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (showTopUp || showWithdraw) ...[
              const SizedBox(height: 8),
              if (showTopUp)
                GestureDetector(
                  onTap: onTopUp,
                  child: _buildActionButton('Top Up', Icons.add),
                ),
              if (showWithdraw)
                GestureDetector(
                  onTap: onWithdraw,
                  child: _buildActionButton('Withdraw', Icons.remove),
                ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white, size: 16),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
