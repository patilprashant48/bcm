const { supabaseAdmin } = require('../config/supabase');

/**
 * Document Generation Service
 * Generates personalized documents from templates
 */

class DocumentService {
    /**
     * Replace placeholders in template with actual data
     */
    replacePlaceholders(template, data) {
        let content = template;

        // Replace all {{placeholder}} with actual values
        Object.keys(data).forEach(key => {
            const placeholder = `{{${key}}}`;
            const value = data[key] || '';
            content = content.split(placeholder).join(value);
        });

        return content;
    }

    /**
     * Generate document from template
     */
    async generateDocument(userId, templateId, data) {
        try {
            // Get template
            const { data: template, error: templateError } = await supabaseAdmin
                .from('document_templates')
                .select('*')
                .eq('id', templateId)
                .eq('is_active', true)
                .single();

            if (templateError || !template) {
                throw new Error('Template not found');
            }

            // Replace placeholders
            const documentContent = this.replacePlaceholders(template.template_content, data);

            // In production, you would:
            // 1. Convert HTML to PDF using puppeteer or similar
            // 2. Upload to Supabase Storage
            // 3. Get public URL
            // For MVP, we'll store the HTML content

            // Save generated document reference
            const { data: generatedDoc, error: docError } = await supabaseAdmin
                .from('generated_documents')
                .insert({
                    user_id: userId,
                    template_id: templateId,
                    document_url: null // In production, this would be the PDF URL
                })
                .select()
                .single();

            if (docError) throw docError;

            return {
                success: true,
                document: generatedDoc,
                content: documentContent // Return HTML for now
            };
        } catch (error) {
            console.error('Generate document error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate business activation documents
     */
    async generateBusinessActivationDocument(userId, businessData) {
        try {
            // Get activation agreement template
            const { data: template, error } = await supabaseAdmin
                .from('document_templates')
                .select('*')
                .eq('document_type', 'ACTIVATION_AGREEMENT')
                .eq('is_active', true)
                .single();

            if (error || !template) {
                console.warn('Activation agreement template not found');
                return { success: false, error: 'Template not found' };
            }

            const documentData = {
                user_name: businessData.user_name,
                business_name: businessData.business_name,
                email: businessData.email,
                mobile: businessData.mobile,
                business_id: businessData.business_id,
                activation_date: new Date().toLocaleDateString('en-IN')
            };

            return await this.generateDocument(userId, template.id, documentData);
        } catch (error) {
            console.error('Generate business activation document error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate plan subscription document
     */
    async generatePlanSubscriptionDocument(userId, planData, userData) {
        try {
            const { data: template, error } = await supabaseAdmin
                .from('document_templates')
                .select('*')
                .eq('document_type', 'PLAN_SUBSCRIPTION')
                .eq('is_active', true)
                .single();

            if (error || !template) {
                console.warn('Plan subscription template not found');
                return { success: false, error: 'Template not found' };
            }

            const documentData = {
                user_name: userData.user_name,
                business_name: userData.business_name || 'N/A',
                email: userData.email,
                mobile: userData.mobile,
                plan_name: planData.plan_name,
                plan_price: planData.plan_price,
                plan_duration: planData.duration_days,
                activation_date: new Date().toLocaleDateString('en-IN'),
                expiry_date: new Date(Date.now() + planData.duration_days * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
                plan_features: JSON.stringify(planData.features, null, 2)
            };

            return await this.generateDocument(userId, template.id, documentData);
        } catch (error) {
            console.error('Generate plan subscription document error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user's generated documents
     */
    async getUserDocuments(userId) {
        try {
            const { data, error } = await supabaseAdmin
                .from('generated_documents')
                .select(`
          *,
          document_templates (
            template_name,
            document_type
          )
        `)
                .eq('user_id', userId)
                .order('generated_at', { ascending: false });

            if (error) throw error;

            return { success: true, documents: data };
        } catch (error) {
            console.error('Get user documents error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get blank template (for users without active plan)
     */
    async getBlankTemplate(templateType) {
        try {
            const { data, error } = await supabaseAdmin
                .from('document_templates')
                .select('template_name, template_content')
                .eq('document_type', templateType)
                .eq('is_active', true)
                .single();

            if (error) throw error;

            // Return template with placeholders intact
            return { success: true, template: data };
        } catch (error) {
            console.error('Get blank template error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new DocumentService();
