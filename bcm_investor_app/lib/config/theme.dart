import 'package:flutter/material.dart';

class AppTheme {
  // Colors (Stock Market Dark Theme)
  static const Color primaryColor = Color(0xFF1E88E5);
  static const Color secondaryColor = Color(0xFF00E676);
  static const Color backgroundColor = Color(0xFF0A0E27);
  static const Color surfaceColor = Color(0xFF1A1F3A);
  static const Color cardColor = Color(0xFF252B4A);
  static const Color errorColor = Color(0xFFFF5252);
  
  // Text Colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB0B3C7);
  static const Color textHint = Color(0xFF6B7280);
  
  // Accent Colors
  static const Color greenAccent = Color(0xFF00E676);
  static const Color redAccent = Color(0xFFFF5252);
  static const Color yellowAccent = Color(0xFFFFC107);
  
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: backgroundColor,
      cardColor: cardColor,
      fontFamily: 'Roboto',
      
      appBarTheme: const AppBarTheme(
        backgroundColor: surfaceColor,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w600,
          fontFamily: 'Roboto',
          letterSpacing: 0.15,
        ),
      ),
      
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surfaceColor,
        selectedItemColor: primaryColor,
        unselectedItemColor: textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 2,
          textStyle: const TextStyle(
            fontFamily: 'Roboto',
            fontWeight: FontWeight.w500,
            fontSize: 16,
            letterSpacing: 0.5,
          ),
        ),
      ),
      
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.all(16),
        hintStyle: const TextStyle(
          color: textHint,
          fontFamily: 'Roboto',
        ),
      ),
      
      cardTheme: const CardThemeData(
        color: cardColor,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16), bottom: Radius.circular(16)),
        ),
      ),
      
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w300, letterSpacing: -1.5),
        displayMedium: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w300, letterSpacing: -0.5),
        displaySmall: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w400),
        headlineMedium: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w400, letterSpacing: 0.25),
        headlineSmall: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w400),
        titleLarge: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w500, letterSpacing: 0.15),
        titleMedium: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w400, letterSpacing: 0.15),
        titleSmall: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w500, letterSpacing: 0.1),
        bodyLarge: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w400, letterSpacing: 0.5),
        bodyMedium: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w400, letterSpacing: 0.25),
        labelLarge: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w500, letterSpacing: 1.25),
        bodySmall: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w400, letterSpacing: 0.4),
        labelSmall: TextStyle(fontFamily: 'Roboto', fontWeight: FontWeight.w400, letterSpacing: 1.5),
      ),
    );
  }
}
