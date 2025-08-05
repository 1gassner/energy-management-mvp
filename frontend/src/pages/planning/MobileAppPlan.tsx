import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface PlanSection {
  id: string;
  title: string;
  completed: boolean;
  content: React.ReactNode;
}

const MobileAppPlan: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('executive-summary');

  const planSections: PlanSection[] = [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      completed: true,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Strategic Opportunity</h3>
            <p className="text-blue-800">
              Mobile app development for CityPulse Hechingen will enable 24/7 energy management, 
              remote monitoring capabilities, and enhanced citizen engagement through mobile accessibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">€45,000</div>
              <div className="text-green-800">Estimated Development Cost</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">6 Monate</div>
              <div className="text-purple-800">Development Timeline</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">ROI 220%</div>
              <div className="text-orange-800">Expected 3-Year ROI</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Key Benefits:</h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>24/7 Remote Monitoring:</strong> Real-time alerts and system status on mobile devices</li>
              <li>• <strong>Increased Efficiency:</strong> Faster response times to energy anomalies (25% improvement)</li>
              <li>• <strong>Citizen Engagement:</strong> Public energy transparency through mobile access</li>
              <li>• <strong>Operational Savings:</strong> Reduced manual monitoring costs (€15,000/year)</li>
              <li>• <strong>Future-Ready:</strong> Platform for smart city expansion</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'user-analysis',
      title: 'User Role Analysis',
      completed: true,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Mobile Requirements by User Type</h3>
          
          <div className="grid gap-4">
            <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">🏛️ Bürgermeister (Mayor)</h4>
              <div className="text-sm text-red-800">
                <p className="mb-2"><strong>Mobile Priorities:</strong> Strategic overview, emergency alerts, budget tracking</p>
                <ul className="space-y-1">
                  <li>• Real-time city-wide energy overview dashboard</li>
                  <li>• Critical alert notifications (push notifications)</li>
                  <li>• Budget performance summary and cost tracking</li>
                  <li>• Offline access to key performance indicators</li>
                  <li>• Quick approval workflows for energy investments</li>
                </ul>
              </div>
            </div>

            <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">👨‍💼 System Administrator</h4>
              <div className="text-sm text-blue-800">
                <p className="mb-2"><strong>Mobile Priorities:</strong> System monitoring, maintenance management, troubleshooting</p>
                <ul className="space-y-1">
                  <li>• Real-time system health monitoring</li>
                  <li>• Sensor status and configuration (limited mobile controls)</li>
                  <li>• Maintenance schedule and task management</li>
                  <li>• Emergency system restart capabilities</li>
                  <li>• Alert management and escalation</li>
                </ul>
              </div>
            </div>

            <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">🏢 Gebäudemanager (Building Manager)</h4>
              <div className="text-sm text-green-800">
                <p className="mb-2"><strong>Mobile Priorities:</strong> Building-specific monitoring, maintenance tasks, energy optimization</p>
                <ul className="space-y-1">
                  <li>• Building-specific energy dashboard</li>
                  <li>• Maintenance task lists and completion tracking</li>
                  <li>• QR code scanning for sensor maintenance</li>
                  <li>• Photo capture for maintenance documentation</li>
                  <li>• Building access control integration</li>
                </ul>
              </div>
            </div>

            <div className="border border-purple-200 bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">👥 Manager & User Roles</h4>
              <div className="text-sm text-purple-800">
                <p className="mb-2"><strong>Mobile Priorities:</strong> Department monitoring, reporting, data access</p>
                <ul className="space-y-1">
                  <li>• Department-specific energy reports</li>
                  <li>• Alert notifications for assigned buildings</li>
                  <li>• Data export functionality</li>
                  <li>• Simple analytics and trend viewing</li>
                  <li>• Collaboration tools for issue reporting</li>
                </ul>
              </div>
            </div>

            <div className="border border-gray-200 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🏛️ Bürger (Citizens)</h4>
              <div className="text-sm text-gray-800">
                <p className="mb-2"><strong>Mobile Priorities:</strong> Public transparency, environmental awareness, civic engagement</p>
                <ul className="space-y-1">
                  <li>• Public energy consumption dashboard</li>
                  <li>• City sustainability metrics and goals</li>
                  <li>• Real-time CO₂ savings information</li>
                  <li>• Energy efficiency tips and education</li>
                  <li>• Simple feedback and suggestion system</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'platform-strategy',
      title: 'Platform Strategy',
      completed: true,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Technology Platform Selection</h3>
          
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">🏆 RECOMMENDED: React Native with Expo</h4>
            <div className="text-sm text-green-800">
              <p className="mb-2"><strong>Warum React Native:</strong></p>
              <ul className="space-y-1 mb-3">
                <li>• <strong>Code Sharing:</strong> 85% gemeinsamer Code zwischen iOS und Android</li>
                <li>• <strong>Existing Expertise:</strong> Team bereits erfahren mit React/TypeScript</li>
                <li>• <strong>Rapid Development:</strong> Schnellere Entwicklung durch bestehende Komponenten</li>
                <li>• <strong>Cost Effective:</strong> 40% geringere Entwicklungskosten als native Apps</li>
                <li>• <strong>Maintenance:</strong> Einfachere Wartung durch einheitliche Codebase</li>
              </ul>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="font-medium">Vorteile:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Hot reload development</li>
                    <li>• OTA updates via Expo</li>
                    <li>• Native performance</li>
                    <li>• Large community support</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Herausforderungen:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Platform-specific optimizations</li>
                    <li>• Bridge performance for complex operations</li>
                    <li>• App store approval processes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Alternative: Native Development</h4>
              <div className="text-sm text-gray-700">
                <p className="mb-2"><strong>iOS (Swift) + Android (Kotlin)</strong></p>
                <ul className="space-y-1">
                  <li><span className="text-green-600">✓</span> Maximum performance and platform integration</li>
                  <li><span className="text-green-600">✓</span> Full access to platform-specific features</li>
                  <li><span className="text-red-600">✗</span> 2x development time and cost</li>
                  <li><span className="text-red-600">✗</span> Separate teams required</li>
                  <li><span className="text-red-600">✗</span> Higher maintenance complexity</li>
                </ul>
                <p className="mt-2 text-xs text-gray-600">Cost: €75,000+ | Timeline: 9-12 months</p>
              </div>
            </div>

            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Alternative: Progressive Web App</h4>
              <div className="text-sm text-gray-700">
                <p className="mb-2"><strong>Web-based mobile experience</strong></p>
                <ul className="space-y-1">
                  <li><span className="text-green-600">✓</span> Lowest development cost</li>
                  <li><span className="text-green-600">✓</span> No app store requirements</li>
                  <li><span className="text-red-600">✗</span> Limited native functionality</li>
                  <li><span className="text-red-600">✗</span> No push notifications on iOS</li>
                  <li><span className="text-red-600">✗</span> Performance limitations</li>
                </ul>
                <p className="mt-2 text-xs text-gray-600">Cost: €25,000 | Timeline: 3-4 months</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Technical Architecture Overview</h4>
            <div className="text-sm text-blue-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium mb-1">Frontend Layer:</p>
                  <ul className="text-xs space-y-1">
                    <li>• React Native 0.72+</li>
                    <li>• TypeScript</li>
                    <li>• Expo SDK 49</li>
                    <li>• React Navigation</li>
                    <li>• React Query</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">API Integration:</p>
                  <ul className="text-xs space-y-1">
                    <li>• REST API integration</li>
                    <li>• WebSocket real-time updates</li>
                    <li>• JWT authentication</li>
                    <li>• Offline data caching</li>
                    <li>• Background sync</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Native Features:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Push notifications</li>
                    <li>• Biometric authentication</li>
                    <li>• Camera for QR codes</li>
                    <li>• Local storage encryption</li>
                    <li>• Background tasks</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'feature-prioritization',
      title: 'Feature Prioritization',
      completed: true,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Feature Development Matrix</h3>
          
          <div className="grid gap-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h4 className="font-semibold text-red-900 mb-2">🚨 Phase 1: Core MVP (Month 1-2)</h4>
              <div className="text-sm text-red-800">
                <p className="mb-2"><strong>Priorität: CRITICAL - Basis-Funktionalität</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-1">Essential Features:</p>
                    <ul className="space-y-1">
                      <li>• User authentication with biometric login</li>
                      <li>• Role-based dashboard views</li>
                      <li>• Real-time energy data display</li>
                      <li>• Critical alert notifications</li>
                      <li>• Building overview screens</li>
                      <li>• Basic settings and preferences</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Technical Foundation:</p>
                    <ul className="space-y-1">
                      <li>• Secure API integration</li>
                      <li>• WebSocket real-time connection</li>
                      <li>• Offline data caching</li>
                      <li>• Push notification setup</li>
                      <li>• Basic error handling</li>
                      <li>• Security implementation</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-xs bg-red-100 p-2 rounded">
                  <strong>Success Criteria:</strong> Users können sich anmelden, Dashboard anzeigen, Alerts erhalten
                </p>
              </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
              <h4 className="font-semibold text-orange-900 mb-2">⚡ Phase 2: Enhanced Functionality (Month 3-4)</h4>
              <div className="text-sm text-orange-800">
                <p className="mb-2"><strong>Priorität: HIGH - Erweiterte Features</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-1">User Experience:</p>
                    <ul className="space-y-1">
                      <li>• Interactive charts and analytics</li>
                      <li>• QR code scanning for maintenance</li>
                      <li>• Photo capture and documentation</li>
                      <li>• Advanced alert management</li>
                      <li>• Data export functionality</li>
                      <li>• Maintenance task management</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Administrative Tools:</p>
                    <ul className="space-y-1">
                      <li>• Building assignment management</li>
                      <li>• User role administration</li>
                      <li>• Sensor status monitoring</li>
                      <li>• Budget tracking tools</li>
                      <li>• Report generation</li>
                      <li>• System health monitoring</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-xs bg-orange-100 p-2 rounded">
                  <strong>Success Criteria:</strong> Gebäudemanager können Wartungsaufgaben mobil verwalten
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">📊 Phase 3: Advanced Analytics (Month 5-6)</h4>
              <div className="text-sm text-yellow-800">
                <p className="mb-2"><strong>Priorität: MEDIUM - Intelligente Features</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-1">Analytics & AI:</p>
                    <ul className="space-y-1">
                      <li>• Predictive maintenance alerts</li>
                      <li>• Energy optimization suggestions</li>
                      <li>• Advanced reporting dashboard</li>
                      <li>• Trend analysis and forecasting</li>
                      <li>• Comparative building analysis</li>
                      <li>• AI-powered insights</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Citizen Engagement:</p>
                    <ul className="space-y-1">
                      <li>• Public energy transparency portal</li>
                      <li>• Gamification for energy saving</li>
                      <li>• Community challenges</li>
                      <li>• Educational content delivery</li>
                      <li>• Feedback and suggestion system</li>
                      <li>• Social sharing features</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-xs bg-yellow-100 p-2 rounded">
                  <strong>Success Criteria:</strong> Bürgermeister erhält proaktive Optimierungsvorschläge
                </p>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h4 className="font-semibold text-green-900 mb-2">🚀 Phase 4: Innovation & Integration (Month 7+)</h4>
              <div className="text-sm text-green-800">
                <p className="mb-2"><strong>Priorität: LOW - Future Features</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-1">Smart City Integration:</p>
                    <ul className="space-y-1">
                      <li>• IoT device integration</li>
                      <li>• Weather data correlation</li>
                      <li>• Traffic/occupancy integration</li>
                      <li>• Smart grid connectivity</li>
                      <li>• Emergency response integration</li>
                      <li>• Regional data sharing</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Advanced Features:</p>
                    <ul className="space-y-1">
                      <li>• Augmented reality for maintenance</li>
                      <li>• Voice control integration</li>
                      <li>• Machine learning optimization</li>
                      <li>• Blockchain energy trading</li>
                      <li>• Advanced security features</li>
                      <li>• Multi-city platform scaling</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-xs bg-green-100 p-2 rounded">
                  <strong>Success Criteria:</strong> CityPulse wird zur Smart City Platform für andere Gemeinden
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'technical-architecture',
      title: 'Technical Architecture',
      completed: true,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Mobile App Technical Architecture</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">System Architecture Diagram</h4>
            <div className="text-sm text-gray-700 bg-white p-4 rounded border font-mono">
              <div className="space-y-2">
                <div>┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐</div>
                <div>│   iOS App       │    │  Android App    │    │   Web Portal    │</div>
                <div>│  (React Native) │    │ (React Native)  │    │    (React)      │</div>
                <div>└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘</div>
                <div>          │                      │                      │</div>
                <div>          └──────────────────────┼──────────────────────┘</div>
                <div>                                 │</div>
                <div>                    ┌─────────────────┐</div>
                <div>                    │   API Gateway   │</div>
                <div>                    │ (Authentication │</div>
                <div>                    │  Rate Limiting) │</div>
                <div>                    └─────────┬───────┘</div>
                <div>                              │</div>
                <div>          ┌───────────────────┼───────────────────┐</div>
                <div>          │                   │                   │</div>
                <div>┌─────────┴───────┐  ┌────────┴────────┐  ┌───────┴────────┐</div>
                <div>│   REST API      │  │  WebSocket API  │  │  Push Service  │</div>
                <div>│   (Express.js)  │  │   (Socket.io)   │  │   (Firebase)   │</div>
                <div>└─────────┬───────┘  └────────┬────────┘  └───────┬────────┘</div>
                <div>          │                   │                   │</div>
                <div>          └───────────────────┼───────────────────┘</div>
                <div>                              │</div>
                <div>                    ┌─────────┴───────┐</div>
                <div>                    │   Database      │</div>
                <div>                    │  (PostgreSQL)   │</div>
                <div>                    └─────────────────┘</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Frontend Architecture</h4>
              <div className="text-sm text-blue-800">
                <p className="mb-2"><strong>React Native + Expo Stack:</strong></p>
                <ul className="space-y-1">
                  <li>• <strong>Navigation:</strong> React Navigation 6</li>
                  <li>• <strong>State Management:</strong> Zustand + React Query</li>
                  <li>• <strong>UI Components:</strong> Custom Design System</li>
                  <li>• <strong>Charts:</strong> React Native Chart Kit</li>
                  <li>• <strong>Authentication:</strong> Expo AuthSession</li>
                  <li>• <strong>Storage:</strong> Expo SecureStore</li>
                  <li>• <strong>Notifications:</strong> Expo Notifications</li>
                  <li>• <strong>Camera:</strong> Expo Camera</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Backend Integration</h4>
              <div className="text-sm text-green-800">
                <p className="mb-2"><strong>API & Services:</strong></p>
                <ul className="space-y-1">
                  <li>• <strong>API Client:</strong> Axios mit Interceptors</li>
                  <li>• <strong>WebSocket:</strong> Socket.io Client</li>
                  <li>• <strong>Authentication:</strong> JWT mit Refresh Tokens</li>
                  <li>• <strong>Caching:</strong> React Query mit Persistence</li>
                  <li>• <strong>Offline Support:</strong> NetInfo + Offline Queue</li>
                  <li>• <strong>Error Handling:</strong> Centralized Error Boundary</li>
                  <li>• <strong>Logging:</strong> Flipper + Reactotron</li>
                  <li>• <strong>Analytics:</strong> Expo Analytics</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">Security Architecture</h4>
            <div className="text-sm text-yellow-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium mb-1">Authentication:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Biometric authentication</li>
                    <li>• JWT token rotation</li>
                    <li>• Session management</li>
                    <li>• Device binding</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Data Protection:</p>
                  <ul className="text-xs space-y-1">
                    <li>• End-to-end encryption</li>
                    <li>• Secure storage (Keychain)</li>
                    <li>• API request signing</li>
                    <li>• Data anonymization</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Network Security:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Certificate pinning</li>
                    <li>• Request validation</li>
                    <li>• Rate limiting</li>
                    <li>• VPN detection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">Performance Optimization</h4>
            <div className="text-sm text-red-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-1">App Performance:</p>
                  <ul className="space-y-1">
                    <li>• Lazy loading für Screens</li>
                    <li>• Image optimization und Caching</li>
                    <li>• Bundle size optimization</li>
                    <li>• Memory management</li>
                    <li>• Background task optimization</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Data Handling:</p>
                  <ul className="space-y-1">
                    <li>• Smart caching strategies</li>
                    <li>• Data pagination</li>
                    <li>• WebSocket connection pooling</li>
                    <li>• Offline-first approach</li>
                    <li>• Real-time update batching</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'development-roadmap',
      title: 'Development Roadmap',
      completed: true,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">6-Month Development Timeline</h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📅 Month 1: Project Setup & Foundation</h4>
              <div className="text-sm text-blue-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-1">Week 1-2: Environment Setup</p>
                    <ul className="space-y-1">
                      <li>• React Native + Expo project initialization</li>
                      <li>• Development environment configuration</li>
                      <li>• CI/CD pipeline setup (GitHub Actions)</li>
                      <li>• Code quality tools (ESLint, Prettier, Husky)</li>
                      <li>• Testing framework setup (Jest, Detox)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Week 3-4: Core Architecture</p>
                    <ul className="space-y-1">
                      <li>• Navigation structure implementation</li>
                      <li>• State management setup (Zustand)</li>
                      <li>• API client configuration</li>
                      <li>• Authentication flow implementation</li>
                      <li>• Design system foundation</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-xs bg-blue-100 p-2 rounded">
                  <strong>Deliverables:</strong> Lauffähige App mit Login, Basic Navigation, API Connection
                </p>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h4 className="font-semibold text-green-900 mb-2">⚡ Month 2: Core Features Development</h4>
              <div className="text-sm text-green-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-1">Week 5-6: Dashboard & Data</p>
                    <ul className="space-y-1">
                      <li>• Role-based dashboard implementation</li>
                      <li>• Real-time data display</li>
                      <li>• WebSocket integration</li>
                      <li>• Basic charts and visualizations</li>
                      <li>• Building overview screens</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Week 7-8: Alerts & Notifications</p>
                    <ul className="space-y-1">
                      <li>• Push notification setup</li>
                      <li>• Alert management system</li>
                      <li>• Notification preferences</li>
                      <li>• Emergency alert handling</li>
                      <li>• Background task processing</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-xs bg-green-100 p-2 rounded">
                  <strong>MVP Completion:</strong> Funktionale App für alle User-Rollen mit Core Features
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">🔧 Month 3: Advanced Functionality</h4>
              <div className="text-sm text-yellow-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-1">Week 9-10: Maintenance Tools</p>
                    <ul className="space-y-1">
                      <li>• QR code scanning implementation</li>
                      <li>• Camera integration for documentation</li>
                      <li>• Maintenance task management</li>
                      <li>• Work order system</li>
                      <li>• Photo capture and upload</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Week 11-12: Analytics & Reports</p>
                    <ul className="space-y-1">
                      <li>• Interactive charts implementation</li>
                      <li>• Data export functionality</li>
                      <li>• Report generation</li>
                      <li>• Trend analysis views</li>
                      <li>• Performance monitoring</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-xs bg-yellow-100 p-2 rounded">
                  <strong>Feature Complete:</strong> Alle geplanten Funktionen für Gebäudemanager implementiert
                </p>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
              <h4 className="font-semibold text-purple-900 mb-2">🚀 Month 4: Testing & Optimization</h4>
              <div className="text-sm text-purple-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-1">Week 13-14: Quality Assurance</p>
                    <ul className="space-y-1">
                      <li>• Comprehensive testing (Unit, Integration, E2E)</li>
                      <li>• Performance optimization</li>
                      <li>• Memory leak detection and fixes</li>
                      <li>• Security penetration testing</li>
                      <li>• Accessibility compliance</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Week 15-16: User Testing</p>
                    <ul className="space-y-1">
                      <li>• Beta testing with real users</li>
                      <li>• User feedback collection</li>
                      <li>• UX improvements implementation</li>
                      <li>• Bug fixes and refinements</li>
                      <li>• Documentation completion</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-xs bg-purple-100 p-2 rounded">
                  <strong>Beta Release:</strong> Stabile App bereit für Produktive Nutzung
                </p>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h4 className="font-semibold text-red-900 mb-2">📱 Month 5: Deployment & Launch</h4>
              <div className="text-sm text-red-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-1">Week 17-18: App Store Preparation</p>
                    <ul className="space-y-1">
                      <li>• App Store and Google Play submission</li>
                      <li>• Store listing optimization</li>
                      <li>• App review and approval process</li>
                      <li>• Production deployment setup</li>
                      <li>• Monitoring and analytics setup</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Week 19-20: Launch & Support</p>
                    <ul className="space-y-1">
                      <li>• Official app launch</li>
                      <li>• User training and documentation</li>
                      <li>• Support system implementation</li>
                      <li>• Launch monitoring and hotfixes</li>
                      <li>• Initial user feedback analysis</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-xs bg-red-100 p-2 rounded">
                  <strong>Production Launch:</strong> App verfügbar in App Stores, alle Nutzer onboarded
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border-l-4 border-gray-500 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">🔄 Month 6: Enhancement & Future Planning</h4>
              <div className="text-sm text-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-1">Week 21-22: Post-Launch Optimization</p>
                    <ul className="space-y-1">
                      <li>• Performance metrics analysis</li>
                      <li>• User behavior analytics</li>
                      <li>• Feature usage optimization</li>
                      <li>• Security updates and improvements</li>
                      <li>• Bug fixes based on real usage</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Week 23-24: Future Planning</p>
                    <ul className="space-y-1">
                      <li>• Phase 2 feature planning</li>
                      <li>• Citizen engagement app design</li>
                      <li>• AI/ML integration roadmap</li>
                      <li>• Smart city expansion strategy</li>
                      <li>• Technology roadmap for 2025</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-xs bg-gray-100 p-2 rounded">
                  <strong>Success Metrics:</strong> 95% User Adoption, {'<'}2s Response Time, {'<'}1% Crash Rate
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'business-case',
      title: 'Business Case & ROI',
      completed: true,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Return on Investment Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">💰 Development Investment</h4>
              <div className="text-sm text-green-800">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Mobile App Development:</span>
                    <span className="font-semibold">€35,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Testing & QA:</span>
                    <span className="font-semibold">€5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>App Store Setup & Marketing:</span>
                    <span className="font-semibold">€2,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Training & Documentation:</span>
                    <span className="font-semibold">€3,000</span>
                  </div>
                  <hr className="my-2 border-green-200" />
                  <div className="flex justify-between font-bold">
                    <span>Total Initial Investment:</span>
                    <span className="text-green-700">€45,000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📊 Annual Operating Costs</h4>
              <div className="text-sm text-blue-800">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>App Store Fees:</span>
                    <span className="font-semibold">€200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Push Notification Service:</span>
                    <span className="font-semibold">€600</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Analytics & Monitoring:</span>
                    <span className="font-semibold">€400</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance & Updates:</span>
                    <span className="font-semibold">€8,000</span>
                  </div>
                  <hr className="my-2 border-blue-200" />
                  <div className="flex justify-between font-bold">
                    <span>Annual Operating Costs:</span>
                    <span className="text-blue-700">€9,200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-yellow-900 mb-2">💡 Quantified Benefits (Annual)</h4>
            <div className="text-sm text-yellow-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-2">Operational Efficiency Gains:</p>
                  <ul className="space-y-1">
                    <li>• <strong>Faster Alert Response:</strong> €8,000 (50% faster response to energy anomalies)</li>
                    <li>• <strong>Reduced Manual Monitoring:</strong> €15,000 (1 FTE equivalent time savings)</li>
                    <li>• <strong>Maintenance Optimization:</strong> €12,000 (25% more efficient maintenance)</li>
                    <li>• <strong>Energy Optimization:</strong> €10,000 (3% improvement in energy efficiency)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Strategic Benefits:</p>
                  <ul className="space-y-1">
                    <li>• <strong>24/7 Monitoring Capability:</strong> €6,000 (Prevent off-hours issues)</li>
                    <li>• <strong>Data-Driven Decisions:</strong> €5,000 (Better investment decisions)</li>
                    <li>• <strong>Citizen Transparency:</strong> €3,000 (Reduced citizen inquiry handling)</li>
                    <li>• <strong>Future-Proofing:</strong> €4,000 (Platform for smart city expansion)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-100 rounded border-l-4 border-yellow-500">
                <div className="flex justify-between font-bold">
                  <span>Total Annual Benefits:</span>
                  <span className="text-yellow-700">€63,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-red-900 mb-2">📈 3-Year ROI Calculation</h4>
            <div className="text-sm text-red-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium mb-2">Year 1:</p>
                  <div className="space-y-1">
                    <div>Benefits: €63,000</div>
                    <div>Investment: €45,000</div>
                    <div>Operating: €9,200</div>
                    <div className="font-bold text-red-700">Net: €8,800</div>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">Year 2:</p>
                  <div className="space-y-1">
                    <div>Benefits: €66,000</div>
                    <div>Investment: €0</div>
                    <div>Operating: €9,200</div>
                    <div className="font-bold text-red-700">Net: €56,800</div>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">Year 3:</p>
                  <div className="space-y-1">
                    <div>Benefits: €69,000</div>
                    <div>Investment: €0</div>
                    <div>Operating: €9,200</div>
                    <div className="font-bold text-red-700">Net: €59,800</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-100 rounded border-l-4 border-red-500">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Total 3-Year Benefits:</span>
                    <span className="font-bold">€198,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total 3-Year Costs:</span>
                    <span className="font-bold">€72,600</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>3-Year ROI:</span>
                    <span className="text-red-700">220%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payback Period:</span>
                    <span className="font-bold">8 months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">🎯 Success Metrics & KPIs</h4>
            <div className="text-sm text-purple-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium mb-1">User Adoption:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Target: 95% user adoption within 3 months</li>
                    <li>• Daily active users: {'>'}80%</li>
                    <li>• User satisfaction: {'>'}4.5/5</li>
                    <li>• App store rating: {'>'}4.0</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Performance:</p>
                  <ul className="text-xs space-y-1">
                    <li>• App load time: {'<'}2 seconds</li>
                    <li>• Crash rate: {'<'}1%</li>
                    <li>• API response time: {'<'}500ms</li>
                    <li>• Offline functionality: 100%</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Business Impact:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Alert response time: -50%</li>
                    <li>• Maintenance efficiency: +25%</li>
                    <li>• Energy optimization: +3%</li>
                    <li>• Operational costs: -15%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      completed: true,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Risk Analysis & Mitigation Strategies</h3>
          
          <div className="space-y-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h4 className="font-semibold text-red-900 mb-2">🚨 HIGH RISK</h4>
              <div className="text-sm text-red-800">
                <div className="grid gap-4">
                  <div className="bg-red-100 p-3 rounded">
                    <p className="font-medium mb-1">App Store Approval Delays</p>
                    <p className="mb-2">Wahrscheinlichkeit: 30% | Impact: High | Timeline: +2-8 weeks</p>
                    <p className="mb-2"><strong>Beschreibung:</strong> Apple/Google App Store Approval kann unvorhersehbar verzögert werden oder abgelehnt werden aufgrund Policy-Verstößen.</p>
                    <div className="mt-2">
                      <p className="font-medium">Mitigation Strategies:</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Early submission mit Beta-Version für Store Review</li>
                        <li>• Detaillierte App Store Guidelines Compliance Check</li>
                        <li>• Parallel Entwicklung einer PWA als Backup</li>
                        <li>• Enterprise Distribution als Alternative (internal users)</li>
                        <li>• Regelmäßige Updates zu Store Policy Changes</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-red-100 p-3 rounded">
                    <p className="font-medium mb-1">Security Vulnerabilities</p>
                    <p className="mb-2">Wahrscheinlichkeit: 25% | Impact: Critical | Kosten: +€10,000</p>
                    <p className="mb-2"><strong>Beschreibung:</strong> Sicherheitslücken in der App könnten sensible Energiedaten oder Systemzugang gefährden.</p>
                    <div className="mt-2">
                      <p className="font-medium">Mitigation Strategies:</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Continuous Security Testing und Penetration Tests</li>
                        <li>• Implementation von OWASP Mobile Security Standards</li>
                        <li>• Regular dependency updates und vulnerability scanning</li>
                        <li>• Multi-factor authentication für alle kritischen Funktionen</li>
                        <li>• Security-focused Code Reviews mit externen Experten</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
              <h4 className="font-semibold text-orange-900 mb-2">⚠️ MEDIUM RISK</h4>
              <div className="text-sm text-orange-800">
                <div className="grid gap-4">
                  <div className="bg-orange-100 p-3 rounded">
                    <p className="font-medium mb-1">Performance Issues on Older Devices</p>
                    <p className="mb-2">Wahrscheinlichkeit: 40% | Impact: Medium | User Impact: 15-20%</p>
                    <p className="mb-2"><strong>Beschreibung:</strong> App könnte auf älteren Android/iOS Geräten langsam oder instabil laufen.</p>
                    <div className="mt-2">
                      <p className="font-medium">Mitigation Strategies:</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Extensive testing auf verschiedenen Geräte-Generationen</li>
                        <li>• Performance-optimierte Komponenten und lazy loading</li>
                        <li>• Minimum system requirements klar definieren</li>
                        <li>• Fallback UI für Low-End Devices</li>
                        <li>• Bundle size optimization und Code splitting</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-orange-100 p-3 rounded">
                    <p className="font-medium mb-1">API Rate Limiting & Backend Load</p>
                    <p className="mb-2">Wahrscheinlichkeit: 35% | Impact: Medium | Kosten: +€5,000</p>
                    <p className="mb-2"><strong>Beschreibung:</strong> Mobile App könnte Backend mit zusätzlichen API Requests überlasten oder Rate Limits erreichen.</p>
                    <div className="mt-2">
                      <p className="font-medium">Mitigation Strategies:</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Smart caching und Offline-first approach</li>
                        <li>• Request batching und intelligent polling</li>
                        <li>• Backend scaling analysis und Capacity Planning</li>
                        <li>• API rate limiting implementation mit graceful degradation</li>
                        <li>• WebSocket optimizations für Real-time Updates</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-orange-100 p-3 rounded">
                    <p className="font-medium mb-1">User Adoption Resistance</p>
                    <p className="mb-2">Wahrscheinlichkeit: 30% | Impact: Medium | ROI Impact: -25%</p>
                    <p className="mb-2"><strong>Beschreibung:</strong> Nutzer könnten sich weigern, von Web auf Mobile zu wechseln oder beide Systeme parallel nutzen.</p>
                    <div className="mt-2">
                      <p className="font-medium">Mitigation Strategies:</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Extensive User Training und Change Management</li>
                        <li>• Mobile-first Features die Web nicht hat (QR codes, Biometrics)</li>
                        <li>• Graduelle Migration mit Hybrid-Periode</li>
                        <li>• User feedback integration während Beta Phase</li>
                        <li>• Incentives für Mobile App Nutzung</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚡ LOW RISK</h4>
              <div className="text-sm text-yellow-800">
                <div className="grid gap-4">
                  <div className="bg-yellow-100 p-3 rounded">
                    <p className="font-medium mb-1">React Native Framework Changes</p>
                    <p className="mb-2">Wahrscheinlichkeit: 20% | Impact: Low-Medium | Kosten: +€2,000</p>
                    <p className="mb-2"><strong>Beschreibung:</strong> React Native Updates könnten Breaking Changes bringen oder Expo SDK Kompatibilitätsprobleme verursachen.</p>
                    <div className="mt-2">
                      <p className="font-medium">Mitigation Strategies:</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Conservative update strategy mit LTS versions</li>
                        <li>• Comprehensive test suite für Framework Updates</li>
                        <li>• Fallback plan für Expo ejection falls nötig</li>
                        <li>• Community monitoring für bekannte Issues</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-100 p-3 rounded">
                    <p className="font-medium mb-1">Third-Party Service Dependencies</p>
                    <p className="mb-2">Wahrscheinlichkeit: 15% | Impact: Low | Kosten: +€3,000</p>
                    <p className="mb-2"><strong>Beschreibung:</strong> Push Notification Services, Analytics, oder andere Third-Party Services könnten Ausfälle haben.</p>
                    <div className="mt-2">
                      <p className="font-medium">Mitigation Strategies:</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Redundant service providers für kritische Features</li>
                        <li>• Graceful degradation wenn Services nicht verfügbar</li>
                        <li>• Local fallbacks für Essential Features</li>
                        <li>• SLA monitoring und alerting</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Overall Risk Assessment</h4>
            <div className="text-sm text-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium mb-1">Timeline Risk:</p>
                  <div className="text-xs space-y-1">
                    <div>Best Case: 5 months</div>
                    <div>Expected: 6 months</div>
                    <div>Worst Case: 8 months</div>
                    <div className="font-bold">Confidence: 85%</div>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-1">Budget Risk:</p>
                  <div className="text-xs space-y-1">
                    <div>Best Case: €42,000</div>
                    <div>Expected: €45,000</div>
                    <div>Worst Case: €60,000</div>
                    <div className="font-bold">Confidence: 80%</div>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-1">Success Risk:</p>
                  <div className="text-xs space-y-1">
                    <div>Technical Success: 90%</div>
                    <div>User Adoption: 75%</div>
                    <div>Business Goals: 85%</div>
                    <div className="font-bold">Overall: 83%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const completedSections = planSections.filter(section => section.completed).length;
  const totalSections = planSections.length;
  const progressPercentage = (completedSections / totalSections) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                CityPulse Mobile App Development Plan
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive strategy for mobile app development and deployment
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Plan Status</div>
              <div className="text-2xl font-bold text-green-600">{progressPercentage}%</div>
              <div className="text-sm text-gray-500">{completedSections} of {totalSections} completed</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">€45,000</div>
            <div className="text-blue-800 text-sm">Development Investment</div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600">6 Monate</div>
            <div className="text-green-800 text-sm">Timeline to Launch</div>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">220% ROI</div>
            <div className="text-purple-800 text-sm">3-Year Return</div>
          </Card>
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="text-2xl font-bold text-orange-600">6 User Types</div>
            <div className="text-orange-800 text-sm">Supported Roles</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Plan Sections</h3>
              <nav className="space-y-2">
                {planSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{section.title}</span>
                      {section.completed && (
                        <span className="text-green-500 text-xs">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {planSections.map((section) => (
              <div
                key={section.id}
                className={activeSection === section.id ? 'block' : 'hidden'}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {section.title}
                    </h2>
                    {section.completed && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Completed
                      </span>
                    )}
                  </div>
                  {section.content}
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button variant="primary" size="lg">
            Approve Development Plan
          </Button>
          <Button variant="secondary" size="lg">
            Request Modifications
          </Button>
          <Button variant="secondary" size="lg">
            Export as PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileAppPlan;