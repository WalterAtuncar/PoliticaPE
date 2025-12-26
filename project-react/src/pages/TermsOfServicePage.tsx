import React from 'react';
import { ArrowLeft, Scale, Shield, FileText, Users, AlertCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-500">Last updated: December 26, 2025</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">1. Acceptance of Terms</h2>
              </div>
              <p>
                By accessing and using PoliticaPE ("the Platform"), you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
              <p>
                PoliticaPE is a political analysis and monitoring platform designed for research, 
                analytics, and informational purposes related to political activities in Peru.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">2. Description of Service</h2>
              </div>
              <p>PoliticaPE provides:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Real-time political sentiment analysis</li>
                <li>Social media monitoring and aggregation from public sources</li>
                <li>News tracking and analysis</li>
                <li>Geographic and demographic political data visualization</li>
                <li>Campaign management tools</li>
                <li>AI-powered recommendations and insights</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">3. User Responsibilities</h2>
              </div>
              <p>As a user of PoliticaPE, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the platform only for lawful purposes</li>
                <li>Not attempt to access data or features without authorization</li>
                <li>Not use the platform to spread misinformation or engage in harmful activities</li>
                <li>Comply with all applicable local, national, and international laws</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">4. Data Collection and Use</h2>
              </div>
              <p>
                PoliticaPE collects and processes publicly available data from social media platforms, 
                news sources, and government databases. We respect intellectual property rights and 
                comply with the terms of service of third-party platforms.
              </p>
              <p>
                The data provided through our platform is for informational and analytical purposes only. 
                We do not guarantee the accuracy, completeness, or timeliness of any information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
              <p>
                All content, features, and functionality of PoliticaPE, including but not limited to 
                text, graphics, logos, and software, are the exclusive property of PoliticaPE and 
                are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p>
                PoliticaPE shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use of or inability to use the platform. 
                We provide the service "as is" without warranties of any kind.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Third-Party Services</h2>
              <p>
                Our platform integrates with third-party services including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>X (Twitter) API</li>
                <li>Meta (Facebook/Instagram) Graph API</li>
                <li>TikTok API</li>
                <li>YouTube Data API</li>
              </ul>
              <p className="mt-4">
                Your use of data from these services is subject to their respective terms of service 
                and privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account and access to the platform 
                at our sole discretion, without notice, for conduct that we believe violates these 
                Terms of Service or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. We will notify 
                users of any material changes by posting the new terms on this page with an updated 
                effective date.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Mail className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">10. Contact Information</h2>
              </div>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="m-0"><strong>Email:</strong> legal@politicape.com</p>
                <p className="m-0"><strong>Website:</strong> https://politicape.com</p>
              </div>
            </section>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>&copy; 2025 PoliticaPE. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
