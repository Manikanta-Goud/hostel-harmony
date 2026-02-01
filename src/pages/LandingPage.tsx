import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight, PlayCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#1a2845] text-white">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">HostelHub</span>
        </div>
        <Button 
          onClick={() => navigate('/login')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 rounded-md"
        >
          Owner Login
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 mb-8">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-orange-200">Built for Hostel Owners</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Never Miss a{' '}
            <span className="text-orange-500">Rent Payment</span>{' '}
            Again
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Stop losing money to forgotten payments and messy records. Track all your hostels, 
            rooms, students, and rent dues in one simple dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/login')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl hover:shadow-orange-500/30 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-2 border-gray-600 hover:border-gray-500 bg-transparent hover:bg-white/5 text-white font-semibold px-8 py-6 text-lg rounded-lg flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              See How It Works
            </Button>
          </div>
        </div>

        {/* Decorative gradient blur effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      </main>
    </div>
  );
};

export default LandingPage;
