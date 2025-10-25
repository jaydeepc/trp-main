import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, DollarSign, Target, MessageCircle, ArrowRight, Shield, Clock,
  TrendingUp, Users, Award, Star, CheckCircle, Play, Calculator,
  FileText, Settings, BarChart3, Globe, Lock, Upload, Brain,
  Sparkles, Factory, Gauge, AlertTriangle, MousePointer, Layers,
  Cpu, Database, Workflow
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

// Animated Counter Component
const AnimatedCounter: React.FC<{
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}> = ({ target, suffix = '', prefix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          let startTime: number;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [target, duration, hasStarted]);

  return (
    <div ref={elementRef} className="text-4xl font-bold mb-2">
      {prefix}{count}{suffix}
    </div>
  );
};

// Scroll Reveal Animation Component
const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-1000 transform ${isVisible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-10 opacity-0'
        }`}
    >
      {children}
    </div>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showROICalculator, setShowROICalculator] = useState(false);
  const [annualSpend, setAnnualSpend] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Add floating animation keyframes to document head
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
        50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
      }
      @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      .animate-pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }
      .animate-gradient {
        background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
        background-size: 400% 400%;
        animation: gradient-shift 5s ease infinite;
      }
    `;
    document.head.appendChild(style);

    // Simulate typing animation on hero
    setTimeout(() => setIsTyping(true), 1000);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleDemoClick = () => {
    handleGetStarted();
  };

  const calculateROI = () => {
    const spend = parseFloat(annualSpend.replace(/,/g, ''));
    if (spend) {
      const savings = spend * 0.152;
      return {
        annualSavings: savings.toLocaleString(),
        monthlySavings: (savings / 12).toLocaleString(),
        timeReduction: Math.round(spend / 100000 * 2.3)
      };
    }
    return null;
  };

  const roi = calculateROI();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-surface-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-4 transition-all duration-500`}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-surface-900">The Robbie Project</h1>
                <p className="text-surface-600 text-sm font-medium">AI Procurement OS</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-surface-600 hover:text-primary-600 font-medium">Features</a>
              <a href="#customers" className="text-surface-600 hover:text-primary-600 font-medium">Customers</a>
              <a href="#pricing" className="text-surface-600 hover:text-primary-600 font-medium">Pricing</a>
              <Button
                onClick={handleGetStarted}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-surface-900 mb-6 leading-tight">
                Cut Procurement Costs by{' '}
                <span className="text-primary-600">15%</span>{' '}
                with AI-Powered RFQs
              </h1>
              <p className="text-xl text-surface-600 mb-8 leading-relaxed">
                Robbie transforms your CAD files and BOMs into professional RFQs in minutes, not days.
                Manufacturing leaders save $2M+ annually with precision procurement.
              </p>

              {/* Value Props */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-surface-900">85% Faster</div>
                    <div className="text-sm text-surface-600">RFQs in hours</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-accent-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-surface-900">15.2% Savings</div>
                    <div className="text-sm text-surface-600">AI-powered costing</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-surface-900">87% Better</div>
                    <div className="text-sm text-surface-600">Supplier matching</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-surface-900">Voice-First</div>
                    <div className="text-sm text-surface-600">No training needed</div>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleDemoClick}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg font-semibold flex items-center justify-center"
                  icon={<Play className="w-5 h-5 mr-2" />}
                >
                  Start Free Demo
                </Button>
                <Button
                  onClick={() => setShowROICalculator(!showROICalculator)}
                  variant="secondary"
                  className="px-8 py-4 text-lg font-semibold flex items-center justify-center"
                  icon={<Calculator className="w-5 h-5 mr-2" />}
                >
                  See ROI Calculator
                </Button>
              </div>
            </div>

            {/* Hero Visual - Interactive Demo Teaser */}
            <div className="relative">
              <Card className="p-8 shadow-2xl border-2 border-primary-100 relative overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-accent-50/50 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-surface-900">Robbie</h3>
                      <p className="text-sm text-surface-600">AI Procurement Assistant</p>
                    </div>
                  </div>

                  <ScrollReveal delay={200}>
                    <div className="bg-surface-50 rounded-xl p-4 mb-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="text-sm text-surface-600 mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        You say:
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-primary-500">
                        {isTyping ? (
                          <span className="text-surface-900">
                            "Analyze this BOM and find the best suppliers for automotive parts"
                          </span>
                        ) : (
                          "Click to interact..."
                        )}
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={400}>
                    <div className="bg-primary-50 rounded-xl p-4 mb-4 hover:shadow-md transition-shadow">
                      <div className="text-sm text-surface-600 mb-2 flex items-center">
                        <Brain className="w-4 h-4 mr-2 text-primary-600" />
                        Robbie responds:
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-accent-500">
                        "I've analyzed <span className='font-bold text-primary-600'>47 components</span>. Found <span className='font-bold text-accent-600'>12 trusted suppliers</span> with <span className='font-bold text-emerald-600'>18% cost savings</span> potential. Would you like to see the breakdown?"
                      </div>
                      {/* Mini metrics */}
                      <div className="flex space-x-4 mt-3 text-xs">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-accent-600" />
                          <span className="text-surface-600">$47K potential savings</span>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={600}>
                    <Button
                      onClick={handleDemoClick}
                      className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold py-3 hover:shadow-xl transition-all duration-300"
                      icon={<ArrowRight className="w-4 h-4 ml-2" />}
                    >
                      Try This Demo
                    </Button>
                  </ScrollReveal>
                </div>
              </Card>
            </div>
          </div>

          {/* ROI Calculator */}
          {showROICalculator && (
            <div className="mt-12">
              <Card className="p-8 max-w-2xl mx-auto border-2 border-accent-200 bg-gradient-to-br from-accent-50 to-primary-50">
                <h3 className="text-2xl font-bold text-surface-900 mb-6 text-center">ROI Calculator</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Annual Procurement Spend ($)
                    </label>
                    <input
                      type="text"
                      value={annualSpend}
                      onChange={(e) => setAnnualSpend(e.target.value)}
                      placeholder="e.g., 5,000,000"
                      className="w-full px-4 py-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  {roi && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                        <div className="text-2xl font-bold text-primary-600">${roi.annualSavings}</div>
                        <div className="text-sm text-surface-600">Annual Savings</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                        <div className="text-2xl font-bold text-accent-600">${roi.monthlySavings}</div>
                        <div className="text-sm text-surface-600">Monthly Savings</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                        <div className="text-2xl font-bold text-emerald-600">{roi.timeReduction} hrs</div>
                        <div className="text-sm text-surface-600">Time Saved Weekly</div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section id="features" className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-surface-900 mb-6">Precision Procurement is Broken</h2>
            <p className="text-xl text-surface-600 max-w-3xl mx-auto">
              Traditional procurement processes cost manufacturers millions in inefficiencies, delays, and missed opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Problem Side */}
            <div>
              <h3 className="text-2xl font-bold text-surface-900 mb-8 flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                The Hidden Costs
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-surface-900 mb-2">Manual Analysis Takes Weeks</h4>
                    <p className="text-surface-600">Engineers spend 50+ hours per BOM analyzing components, researching suppliers, and calculating costs.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-surface-900 mb-2">Cost Overruns Average 25%</h4>
                    <p className="text-surface-600">Inaccurate estimates and poor supplier selection lead to budget overruns on most projects.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-surface-900 mb-2">Supply Chain Risk</h4>
                    <p className="text-surface-600">Limited supplier visibility increases risk of delays, quality issues, and compliance problems.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution Side */}
            <div>
              <h3 className="text-2xl font-bold text-surface-900 mb-8 flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                </div>
                Robbie Fixes This
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-surface-900 mb-2">AI Analysis in Minutes</h4>
                    <p className="text-surface-600">Upload your BOM and get comprehensive analysis with cost estimates and supplier recommendations instantly.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-surface-900 mb-2">Zero-Based Costing</h4>
                    <p className="text-surface-600">AI-powered cost analysis identifies 15%+ savings opportunities with precision forecasting.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-surface-900 mb-2">Smart Supplier Matching</h4>
                    <p className="text-surface-600">Intelligent trust scoring and regional recommendations reduce risk and improve quality.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Success Section */}
      <section id="customers" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-surface-900 mb-6">Trusted by Manufacturing Leaders</h2>
            <p className="text-xl text-surface-600">
              Over 500 precision manufacturers rely on Robbie for smarter procurement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="p-8 text-center border-2 border-primary-100 hover:border-primary-200 transition-colors">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Factory className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">AeroTech Industries</h3>
              <p className="text-surface-600 mb-4">"Reduced procurement cycle by 60% and saved $2.4M in first year"</p>
              <div className="flex items-center justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </Card>

            <Card className="p-8 text-center border-2 border-accent-100 hover:border-accent-200 transition-colors">
              <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">Precision Electronics</h3>
              <p className="text-surface-600 mb-4">"Cut sourcing costs 18% with better supplier intelligence"</p>
              <div className="flex items-center justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </Card>

            <Card className="p-8 text-center border-2 border-emerald-100 hover:border-emerald-200 transition-colors">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">MedDevice Corp</h3>
              <p className="text-surface-600 mb-4">"Streamlined compliance tracking and reduced audit time by 40%"</p>
              <div className="flex items-center justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </Card>
          </div>

          {/* Stats with Animated Counters */}
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                <div className="text-primary-600">
                  <AnimatedCounter target={500} suffix="+" />
                </div>
                <div className="text-surface-600 font-medium">Manufacturing Companies</div>
              </div>
              <div>
                <div className="text-accent-600">
                  <AnimatedCounter target={50} prefix="$" suffix="M+" />
                </div>
                <div className="text-surface-600 font-medium">Total Savings Generated</div>
              </div>
              <div>
                <div className="text-emerald-600">
                  <AnimatedCounter target={85} suffix="%" />
                </div>
                <div className="text-surface-600 font-medium">Faster Processing</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-surface-900 mb-6">How Robbie Works</h2>
            <p className="text-xl text-surface-600 max-w-3xl mx-auto">
              From document upload to professional RFQ in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary-600" />
              </div>
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">1</div>
              <h3 className="text-lg font-bold text-surface-900 mb-2">Upload & Extract</h3>
              <p className="text-surface-600">Upload CAD files, PDFs, or Excel sheets. Robbie extracts component data automatically.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-accent-600" />
              </div>
              <div className="w-8 h-8 bg-accent-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">2</div>
              <h3 className="text-lg font-bold text-surface-900 mb-2">Define Requirements</h3>
              <p className="text-surface-600">Set supplier priorities, compliance needs, and lead times through voice or forms.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">3</div>
              <h3 className="text-lg font-bold text-surface-900 mb-2">AI Analysis</h3>
              <p className="text-surface-600">AI analyzes components, suggests alternatives, calculates costs, and matches suppliers.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">4</div>
              <h3 className="text-lg font-bold text-surface-900 mb-2">Professional RFQ</h3>
              <p className="text-surface-600">Generate and send professional RFQs with detailed specifications and terms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-surface-900 mb-6">Enterprise-Grade Security</h2>
            <p className="text-xl text-surface-600">
              Your data is protected with industry-leading security standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-surface-900 mb-2">SOC 2 Type II</h3>
              <p className="text-surface-600">Comprehensive security controls audited by third-party assessors.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-lg font-bold text-surface-900 mb-2">End-to-End Encryption</h3>
              <p className="text-surface-600">All data encrypted in transit and at rest with AES-256 encryption.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-surface-900 mb-2">Global Compliance</h3>
              <p className="text-surface-600">GDPR, CCPA, and industry-specific compliance built-in.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Procurement?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join 500+ manufacturing leaders who've cut costs by 15% and accelerated their RFQ process by 85% with Robbie.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDemoClick}
              className="inline-flex items-center justify-center bg-white text-primary-600 hover:bg-surface-50 px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Free Demo
            </button>
            <button
              onClick={() => setShowROICalculator(true)}
              className="inline-flex items-center justify-center bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Calculate Your ROI
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className={`flex items-center space-x-4 transition-all duration-500`}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">The Robbie Project</h1>
                <p className="text-surface-600 text-sm font-medium">AI Procurement OS</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-surface-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#customers" className="hover:text-white transition-colors">Customers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-surface-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-surface-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-surface-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-surface-400">
              © 2025 The Robbie Project. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-surface-400" />
                <span className="text-sm text-surface-400">SOC 2 Certified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-surface-400" />
                <span className="text-sm text-surface-400">Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
