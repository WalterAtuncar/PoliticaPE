import React from 'react';
import { ArrowLeft, Shield, Eye, Database, Lock, Globe, Mail, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicyPage: React.FC = () => {
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
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-500">Last updated: December 26, 2025</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <section className="mb-8">
              <p className="text-lg">
                At PoliticaPE, we are committed to protecting your privacy and ensuring the security 
                of your personal information. This Privacy Policy explains how we collect, use, 
                disclose, and safeguard your information when you use our political analysis platform.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Database className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">1. Information We Collect</h2>
              </div>
              
              <h3 className="text-lg font-medium text-gray-800 mt-4">Personal Information</h3>
              <p>When you register for an account, we may collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name and email address</li>
                <li>Organization or company name</li>
                <li>Password (encrypted)</li>
                <li>Profile preferences and settings</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-4">Usage Data</h3>
              <p>We automatically collect information about how you interact with our platform:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pages visited and features used</li>
                <li>Time spent on the platform</li>
                <li>Search queries and filters applied</li>
                <li>Device information and browser type</li>
                <li>IP address and approximate location</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-4">Third-Party Data</h3>
              <p>
                We collect and process publicly available data from social media platforms 
                (X/Twitter, Facebook, Instagram, TikTok, YouTube) and news sources for 
                political analysis purposes.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Eye className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">2. How We Use Your Information</h2>
              </div>
              <p>We use the collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our political analysis services</li>
                <li>Personalize your experience and content recommendations</li>
                <li>Process your requests and respond to inquiries</li>
                <li>Send important updates about our services</li>
                <li>Improve our platform through analytics and research</li>
                <li>Detect and prevent fraud or unauthorized access</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Globe className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">3. Information Sharing</h2>
              </div>
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform</li>
                <li><strong>Analytics Partners:</strong> To help us understand platform usage</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
              </ul>
              <p className="mt-4">
                <strong>We do not sell your personal information to third parties.</strong>
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Lock className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">4. Data Security</h2>
              </div>
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Secure password hashing using bcrypt</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure cloud infrastructure with regular backups</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center mb-4">
                <UserCheck className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">5. Your Rights</h2>
              </div>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your experience. These include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active or as 
                needed to provide our services. You may request deletion of your account at any time. 
                Some data may be retained for legal compliance purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. International Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your 
                country of residence. We ensure appropriate safeguards are in place to protect your 
                data in accordance with applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p>
                Our platform is not intended for users under 18 years of age. We do not knowingly 
                collect personal information from children. If we become aware of such collection, 
                we will take steps to delete the information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by posting the new policy on this page and updating the 
                "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Mail className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 m-0">11. Contact Us</h2>
              </div>
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="m-0"><strong>Email:</strong> privacy@politicape.com</p>
                <p className="m-0"><strong>Data Protection Officer:</strong> dpo@politicape.com</p>
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
