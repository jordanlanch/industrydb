'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth.store';
import { userService } from '@/services/user.service';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Sparkles,
  Target,
  Search,
  Download,
  Rocket,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [formData, setFormData] = useState({
    industry: '',
    country: '',
    city: '',
  });

  const totalSteps = 5;

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Mark onboarding as complete via backend
      setIsCompleting(true);
      try {
        await userService.completeOnboarding();
        toast({
          title: 'Welcome to IndustryDB!',
          description: 'Your onboarding is complete. Let\'s start finding leads!',
          variant: 'default',
        });
        router.push('/dashboard/leads');
      } catch (error: any) {
        console.error('Failed to complete onboarding:', error);
        toast({
          title: 'Error',
          description: 'Failed to complete onboarding. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsCompleting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = async () => {
    // Also mark onboarding as complete when skipping
    try {
      await userService.completeOnboarding();
    } catch (error) {
      console.error('Failed to mark onboarding complete:', error);
      // Don't block user from skipping even if API fails
    }
    router.push('/dashboard/leads');
  };

  const progressPercentage = (step / totalSteps) * 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return <WelcomeStep user={user} />;
      case 2:
        return <IndustryStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <GoalsStep />;
      case 4:
        return <FirstSearchStep formData={formData} />;
      case 5:
        return <CompletionStep />;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1 || isCompleting}
                className="min-w-[100px]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                className="min-w-[100px]"
                disabled={isCompleting}
              >
                {step === totalSteps ? (
                  <>
                    {isCompleting ? 'Completing...' : 'Get Started'}
                    <Rocket className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WelcomeStep({ user }: { user: any }) {
  return (
    <div className="text-center space-y-6">
      <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
        <Sparkles className="h-12 w-12 text-purple-600" />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to IndustryDB, {user?.name}!</h1>
        <p className="text-lg text-muted-foreground">
          Let's get you set up in just a few steps
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          What you'll learn:
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>How to search for leads in your industry</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>How to export data to CSV or Excel</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>How to manage your subscription and usage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Tips for getting the most out of IndustryDB</span>
          </li>
        </ul>
      </div>
      <p className="text-sm text-muted-foreground">
        This will only take 2 minutes
      </p>
    </div>
  );
}

function IndustryStep({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: any;
}) {
  const industries = [
    { value: 'tattoo', label: 'Tattoo Studios', icon: '🎨' },
    { value: 'beauty', label: 'Beauty Salons', icon: '💅' },
    { value: 'barber', label: 'Barber Shops', icon: '✂️' },
    { value: 'gym', label: 'Gyms & Fitness', icon: '💪' },
    { value: 'restaurant', label: 'Restaurants', icon: '🍽️' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Choose Your Industry</h2>
        <p className="text-muted-foreground">
          Select the industry you're interested in targeting
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {industries.map((industry) => (
          <button
            key={industry.value}
            onClick={() => setFormData({ ...formData, industry: industry.value })}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              formData.industry === industry.value
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 hover:border-purple-300 hover:shadow'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{industry.icon}</span>
              <div>
                <h3 className="font-semibold">{industry.label}</h3>
                <p className="text-xs text-muted-foreground">
                  Verified business data
                </p>
              </div>
              {formData.industry === industry.value && (
                <CheckCircle className="h-5 w-5 text-purple-600 ml-auto" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>💡 Tip:</strong> You can search any industry later. This just helps us
          customize your experience.
        </p>
      </div>
    </div>
  );
}

function GoalsStep() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goals = [
    { id: 'leads', label: 'Generate sales leads', icon: '📈' },
    { id: 'research', label: 'Market research', icon: '🔍' },
    { id: 'outreach', label: 'Email/SMS campaigns', icon: '📧' },
    { id: 'prospecting', label: 'Cold calling', icon: '📞' },
    { id: 'analysis', label: 'Competitive analysis', icon: '📊' },
    { id: 'partnership', label: 'Find partners', icon: '🤝' },
  ];

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((id) => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">What's Your Goal?</h2>
        <p className="text-muted-foreground">
          Select all that apply (we'll customize your experience)
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              selectedGoals.includes(goal.id)
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:shadow'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{goal.icon}</span>
              <span className="font-medium">{goal.label}</span>
              {selectedGoals.includes(goal.id) && (
                <CheckCircle className="h-5 w-5 text-blue-600 ml-auto" />
              )}
            </div>
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Selected: {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function FirstSearchStep({ formData }: { formData: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Search className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">How to Search Leads</h2>
        <p className="text-muted-foreground">
          Find exactly what you need with powerful filters
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              1
            </span>
            Choose Your Filters
          </h3>
          <div className="space-y-3 pl-8">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">Industry</Badge>
              <span className="text-muted-foreground">
                {formData.industry || 'tattoo, beauty, gym, etc.'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">Location</Badge>
              <span className="text-muted-foreground">Country, State, City</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">Contact Info</Badge>
              <span className="text-muted-foreground">Email, Phone, Website</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              2
            </span>
            Browse Results
          </h3>
          <p className="text-sm text-muted-foreground pl-8">
            View business name, address, phone, email, website, and more. All data is
            verified and up-to-date.
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              3
            </span>
            Export to CSV/Excel
          </h3>
          <p className="text-sm text-muted-foreground pl-8">
            Download your leads in CSV or Excel format for use in CRM, email campaigns, or
            cold calling.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Download className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-900 mb-1">Your Current Plan</p>
          <p className="text-blue-700">
            You can search <strong>50 leads</strong> per month on the free tier. Upgrade
            anytime for more.
          </p>
        </div>
      </div>
    </div>
  );
}

function CompletionStep() {
  return (
    <div className="text-center space-y-6">
      <div className="inline-block p-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-full mb-4">
        <Rocket className="h-12 w-12 text-green-600" />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-2">You're All Set!</h1>
        <p className="text-lg text-muted-foreground">
          Let's start finding your perfect leads
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Quick Tips for Success:</h3>
        <ul className="space-y-3 text-left text-sm">
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Start broad, then narrow:</strong> Begin with a country filter, then
              add city for more specific results
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Use email/phone filters:</strong> Only show leads with contact info
              you need
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Export strategically:</strong> Each export counts toward your monthly
              limit
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Verify email addresses:</strong> Check the "Email Verified" filter for
              higher quality
            </span>
          </li>
        </ul>
      </div>

      <div className="grid md:grid-cols-3 gap-4 pt-4">
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Pro Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Upgrade to Pro for 2,000 leads/month + email addresses
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Need help? Email us at support@industrydb.io
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4" />
              API Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Business plan includes full API access
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
