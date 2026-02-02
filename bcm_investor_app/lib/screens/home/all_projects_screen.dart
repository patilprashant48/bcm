import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/project_card.dart';

class AllProjectsScreen extends StatefulWidget {
  final List<dynamic> projects;
  
  const AllProjectsScreen({Key? key, required this.projects}) : super(key: key);

  @override
  State<AllProjectsScreen> createState() => _AllProjectsScreenState();
}

class _AllProjectsScreenState extends State<AllProjectsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('All Projects'),
      ),
      body: widget.projects.isEmpty
          ? const Center(child: Text('No projects found'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: widget.projects.length,
              itemBuilder: (context, index) {
                return ProjectCard(project: widget.projects[index]);
              },
            ),
    );
  }
}
