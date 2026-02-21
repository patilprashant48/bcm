const models = require('../database/mongodb-schema');
const Project = models.Project;

/**
 * Create a new project
 */
exports.createProject = async (req, res) => {
    try {
        const {
            project_name,
            description,
            project_type,
            required_capital,
            expected_roi,
            duration_months,
            location,
            start_date,
            business_plan,
            risk_factors
        } = req.body;

        // Validate required fields
        if (!project_name || !description || !project_type || !required_capital ||
            !location || !start_date) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Map frontend fields to schema fields
        const project = new Project({
            userId: req.user.id,
            projectName: project_name,
            description: description,
            projectType: project_type, // Frontend sends correct enum value
            category: 'OFFLINE', // Default, can be made dynamic
            requiredCapital: parseFloat(required_capital),
            projectCost: parseFloat(required_capital), // Using same value for now
            location: location,
            startDate: new Date(start_date),
            status: 'NEW' // Use 'NEW' instead of 'PENDING_APPROVAL'
        });

        await project.save();

        res.status(201).json({
            success: true,
            message: 'Project created successfully and submitted for approval',
            project: {
                id: project._id,
                project_name: project.projectName,
                status: project.status,
                required_capital: project.requiredCapital,
                created_at: project.createdAt
            }
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: error.message
        });
    }
};

/**
 * Get all projects for the logged-in business
 */
exports.getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select('-__v');

        res.json({
            success: true,
            projects: projects.map(project => ({
                id: project._id,
                project_name: project.projectName,
                description: project.description,
                project_type: project.projectType,
                category: project.category,
                required_capital: project.requiredCapital,
                project_cost: project.projectCost,
                location: project.location,
                start_date: project.startDate,
                status: project.status,
                created_at: project.createdAt,
                updated_at: project.updatedAt
            }))
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
            error: error.message
        });
    }
};

/**
 * Get project details by ID
 */
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            userId: req.user.id
        }).select('-__v');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.json({
            success: true,
            project: {
                id: project._id,
                project_name: project.projectName,
                description: project.description,
                project_type: project.projectType,
                category: project.category,
                required_capital: project.requiredCapital,
                project_cost: project.projectCost,
                location: project.location,
                start_date: project.startDate,
                expected_roi: project.expectedRoi,
                duration_months: project.durationMonths,
                business_plan: project.businessPlan,
                risk_factors: project.riskFactors,
                status: project.status,
                created_at: project.createdAt,
                updated_at: project.updatedAt
            }
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project',
            error: error.message
        });
    }
};

/**
 * Update project
 */
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Only allow updates if project is in DRAFT, RECHECK, or NEW (before approval)
        const allowedStatuses = ['DRAFT', 'REJECTED', 'RECHECK', 'NEW'];
        if (!allowedStatuses.includes(project.status)) {
            return res.status(403).json({
                success: false,
                message: 'Cannot update project in current status'
            });
        }

        const {
            project_name, description, project_type, required_capital,
            expected_roi, duration_months, location, start_date,
            business_plan, risk_factors
        } = req.body;

        // Map fields
        if (project_name) project.projectName = project_name;
        if (description) project.description = description;
        if (project_type) project.projectType = project_type;
        if (required_capital) {
            project.requiredCapital = parseFloat(required_capital);
            project.projectCost = parseFloat(required_capital); // Sync cost
        }
        if (expected_roi) project.expectedRoi = parseFloat(expected_roi); // Check if schema has expectedRoi?
        if (duration_months) project.durationMonths = parseInt(duration_months); // Check schema
        if (location) project.location = location;
        if (start_date) project.startDate = new Date(start_date);
        if (business_plan) project.businessPlan = business_plan; // Check schema
        if (risk_factors) project.riskFactors = risk_factors; // Check schema

        // Reset to NEW for admin re-evaluation
        project.status = 'NEW';
        project.updatedAt = new Date();

        await project.save();

        res.json({
            success: true,
            message: 'Project updated successfully and resubmitted',
            project: {
                id: project._id,
                project_name: project.projectName,
                status: project.status,
                updated_at: project.updatedAt
            }
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project',
            error: error.message
        });
    }
};

/**
 * Delete project
 */
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            business_id: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Only allow deletion if project is in DRAFT or REJECTED status
        if (project.status !== 'DRAFT' && project.status !== 'REJECTED') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete project in current status'
            });
        }

        await Project.deleteOne({ _id: project._id });

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project',
            error: error.message
        });
    }
};
