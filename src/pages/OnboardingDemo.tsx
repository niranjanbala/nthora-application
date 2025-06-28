import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageSquare, 
  Sparkles, 
  Bot, 
  User, 
  Users,
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle, 
  Zap, 
  Star, 
  Shield,
  Volume2,
  Pause
} from 'lucide-react';
import { 
  generateAgenticResponse,
  getQuestionById,
  getQuestionResponses,
  markResponseHelpful
} from '../services/questionRoutingService';
import { elevenLabsService } from '../services/elevenLabsService';

interface OnboardingDemoProps {
  questionId?: string;
  onComplete?: () => void;
  currentStruggles?: string;
}

const OnboardingDemo: React.FC<OnboardingDemoProps> = ({ 
  questionId, 
  onComplete,
  currentStruggles
}) => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingResponse, setGeneratingResponse] = useState<'low' | 'medium' | 'high' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoStage, setDemoStage] = useState<'intro' | 'question' | 'responses' | 'comparison'>('intro');
  const [demoQuestion, setDemoQuestion] = useState<string>('');
  
  // Audio playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentPlayingText, setCurrentPlayingText] = useState<string | null>(null);

  useEffect(() => {
    if (questionId) {
      loadQuestionData(questionId);
    } else if (currentStruggles) {
      // Create a demo question based on user's struggles
      setDemoQuestion(currentStruggles);
      setDemoStage('question');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [questionId, currentStruggles]);

  const loadQuestionData = async (id: string) => {
    setLoading(true);
    try {
      const [questionData, responsesData] = await Promise.all([
        getQuestionById(id),
        getQuestionResponses(id)
      ]);

      setQuestion(questionData);
      setResponses(responsesData);
      setDemoStage('responses');
    } catch (error) {
      console.error('Error loading question data:', error);
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResponse = async (qualityLevel: 'low' | 'medium' | 'high') => {
    if (!questionId) return;

    setGeneratingResponse(qualityLevel);
    setError(null);

    try {
      const result = await generateAgenticResponse(questionId, qualityLevel);
      
      if (result.success) {
        await loadQuestionData(questionId); // Reload to show new response
      } else {
        setError(result.error || 'Failed to generate response');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setGeneratingResponse(null);
    }
  };

  const handleVoteResponse = async (responseId: string, isHelpful: boolean) => {
    try {
      await markResponseHelpful(responseId, isHelpful);
      if (questionId) {
        await loadQuestionData(questionId); // Reload to show updated votes
      }
    } catch (error) {
      console.error('Error voting on response:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getQualityLevelBadge = (qualityLevel?: string) => {
    if (!qualityLevel) return null;
    
    switch (qualityLevel) {
      case 'low':
        return (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <AlertCircle className="h-3 w-3" />
            <span>Basic</span>
          </span>
        );
      case 'medium':
        return (
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>Good</span>
          </span>
        );
      case 'high':
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>Expert</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getResponseBackground = (response: any) => {
    if (response.source_type === 'agentic_human') {
      switch (response.quality_level) {
        case 'low': return 'bg-red-50 border-red-200';
        case 'medium': return 'bg-yellow-50 border-yellow-200';
        case 'high': return 'bg-green-50 border-green-200';
        default: return 'bg-blue-50 border-blue-200';
      }
    }
    return 'bg-surface-50 border-surface-200';
  };

  // Handle text-to-speech playback
  const handlePlayText = async (text: string) => {
    // If the same text is already playing, toggle pause/play
    if (currentAudio && currentPlayingText === text) {
      if (isPlayingAudio) {
        currentAudio.pause();
        setIsPlayingAudio(false);
      } else {
        currentAudio.play();
        setIsPlayingAudio(true);
      }
      return;
    }
    
    // If different audio is playing, stop it
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    
    try {
      setIsPlayingAudio(true);
      setCurrentPlayingText(text);
      
      const result = await elevenLabsService.textToSpeech(text);
      
      if (!result.success || !result.audioUrl) {
        console.error('Failed to get audio:', result.error);
        setIsPlayingAudio(false);
        setCurrentPlayingText(null);
        return;
      }
      
      const audio = new Audio(result.audioUrl);
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        setCurrentAudio(null);
        setCurrentPlayingText(null);
      };
      
      audio.onerror = () => {
        console.error('Audio playback error');
        setIsPlayingAudio(false);
        setCurrentAudio(null);
        setCurrentPlayingText(null);
      };
      
      setCurrentAudio(audio);
      audio.play();
    } catch (error) {
      console.error('Error playing text:', error);
      setIsPlayingAudio(false);
      setCurrentPlayingText(null);
    }
  };

  const renderIntroStage = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="h-10 w-10 text-white" />
      </div>
      
      <div>
        <div className="flex items-center justify-center space-x-2">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            See how N-th`ora works
          </h2>
          <button 
            onClick={() => handlePlayText("See how N-th`ora works")}
            className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
            aria-label="Listen to heading"
          >
            {isPlayingAudio && currentPlayingText === "See how N-th`ora works" ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Let's demonstrate how our AI-powered expert matching works. We'll show you different quality levels of responses and how our system helps you find the best answers.
          </p>
          <button 
            onClick={() => handlePlayText("Let's demonstrate how our AI-powered expert matching works. We'll show you different quality levels of responses and how our system helps you find the best answers.")}
            className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
            aria-label="Listen to description"
          >
            {isPlayingAudio && currentPlayingText === "Let's demonstrate how our AI-powered expert matching works. We'll show you different quality levels of responses and how our system helps you find the best answers." ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="bg-purple-50 rounded-xl p-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-purple-900 mb-2">How the Demo Works</h3>
        <div className="space-y-3 text-sm text-purple-700">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>We'll show you a sample question based on your interests</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>You'll see different quality levels of responses</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>Compare how our system helps identify the best experts</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setDemoStage('question')}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        Start Demo
      </button>
    </div>
  );

  const renderQuestionStage = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setDemoStage('intro')}
          className="p-2 text-ink-light hover:text-ink-dark transition-colors duration-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-medium text-ink-dark">Sample Question</h1>
          <p className="text-ink-light">Based on your interests</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-surface-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-medium text-ink-dark">
                {demoQuestion ? 
                  `How can I improve ${demoQuestion.split(' ').slice(0, 3).join(' ')}?` : 
                  "How can I improve my team's productivity while maintaining work-life balance?"}
              </h2>
            </div>
            
            <div className="prose max-w-none text-ink-base mb-4">
              <p className="whitespace-pre-wrap">
                {demoQuestion ? 
                  `I'm currently facing challenges with ${demoQuestion}. What are some proven strategies or approaches that have worked for others? I'm looking for both quick wins and long-term solutions.` : 
                  "I'm leading a team of 12 engineers and designers, and I've noticed that while we're meeting deadlines, people seem burned out. I want to maintain our productivity while ensuring everyone has a healthy work-life balance. What strategies have worked for others in similar situations?"}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-accent-50 text-accent-700 px-3 py-1 rounded-full text-sm font-medium border border-accent-200">
                {demoQuestion ? demoQuestion.split(' ').slice(0, 1).join(' ') : "Team Management"}
              </span>
              <span className="bg-accent-50 text-accent-700 px-3 py-1 rounded-full text-sm font-medium border border-accent-200">
                {demoQuestion ? demoQuestion.split(' ').slice(1, 2).join(' ') : "Productivity"}
              </span>
              <span className="bg-surface-50 text-ink-light px-3 py-1 rounded-full text-sm border border-surface-200">
                {demoQuestion ? demoQuestion.split(' ').slice(2, 3).join(' ') : "Work-Life Balance"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setDemoStage('responses')}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          See Responses
        </button>
      </div>
    </div>
  );

  const renderResponsesStage = () => {
    // Sample responses of different quality levels
    const sampleResponses = [
      {
        id: 'sample-low',
        source_type: 'agentic_human',
        quality_level: 'low',
        content: demoQuestion ? 
          `You should try to improve ${demoQuestion}. Maybe read some books or articles about it. There are probably some good resources online. Good luck!` : 
          "Try having fewer meetings. Also maybe let people work from home sometimes. Team building activities can help too I think.",
        helpful_votes: 1,
        unhelpful_votes: 5,
        quality_score: 0.3,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        responder: { full_name: "Alex Johnson" }
      },
      {
        id: 'sample-medium',
        source_type: 'agentic_human',
        quality_level: 'medium',
        content: demoQuestion ? 
          `To improve ${demoQuestion}, consider these approaches:\n\n1. Analyze your current processes to identify bottlenecks\n2. Implement regular feedback sessions with stakeholders\n3. Look into tools that might help streamline your workflow\n\nMany teams find that a combination of process improvements and better communication leads to significant gains.` : 
          "To balance productivity and well-being, consider:\n\n1. Implement core collaboration hours (e.g., 10am-2pm) where meetings are scheduled, leaving other time for focused work\n2. Regular 1:1s that include well-being check-ins\n3. Encourage actual time off - lead by example by taking breaks yourself\n4. Set clear priorities so team members aren't pulled in too many directions\n\nMeasure outcomes rather than hours worked, and be flexible with how people achieve their goals.",
        helpful_votes: 7,
        unhelpful_votes: 2,
        quality_score: 0.6,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        responder: { full_name: "Taylor Smith" }
      },
      {
        id: 'sample-high',
        source_type: 'agentic_human',
        quality_level: 'high',
        content: demoQuestion ? 
          `# Strategies to Improve ${demoQuestion}\n\n## Quick Wins\n\n1. **Process Mapping**: Spend a day documenting your current approach to identify immediate bottlenecks\n2. **Stakeholder Interviews**: Gather perspectives from 5-7 key stakeholders to understand pain points\n3. **Tool Assessment**: Evaluate if your current tools support or hinder your goals\n\n## Medium-term Solutions\n\n1. **Implement Agile Methodologies**: Consider 2-week sprints with clear deliverables\n2. **Establish Metrics**: Define 3-5 KPIs to track progress objectively\n3. **Regular Retrospectives**: Hold bi-weekly sessions to continuously improve\n\n## Long-term Approach\n\n1. **Capability Building**: Invest in training for your team in key areas\n2. **Strategic Alignment**: Ensure your improvements align with broader organizational goals\n3. **Knowledge Management**: Create systems to document learnings and best practices\n\nI've implemented similar approaches at three different organizations and found that the combination of immediate process improvements with strategic capability building yields the best results. Happy to discuss specific aspects in more detail!` : 
          "# Balancing Team Productivity and Well-being\n\n## Immediate Actions\n\n1. **Audit Your Meeting Culture**: \n   - Implement \"No Meeting Wednesdays\" for focused work\n   - Require agendas for all meetings and end 5 minutes early\n   - Convert status updates to async communication\n\n2. **Workload Management**:\n   - Use a capacity planning tool (e.g., Linear, Jira) to visualize team bandwidth\n   - Implement a \"one in, one out\" policy for new projects\n   - Create a backlog prioritization framework the team understands\n\n3. **Well-being Infrastructure**:\n   - Normalize taking breaks by blocking \"focus time\" and \"break time\" on your own calendar\n   - Establish communication SLAs (e.g., \"no expectation of response after 6pm\")\n   - Rotate meeting facilitators to distribute emotional labor\n\n## Systemic Changes\n\n1. **Outcome-Based Performance Metrics**:\n   - Shift from activity metrics to impact metrics\n   - Document what \"good work\" looks like for each role\n   - Celebrate quality over quantity\n\n2. **Team Operating Principles**:\n   - Co-create team values around sustainable pace\n   - Establish \"core collaboration hours\" (e.g., 10am-2pm)\n   - Create a \"burnout buddy\" system for peer support\n\nI've implemented these approaches at both startups and enterprise companies. The key is consistency and modeling the behavior yourself as a leader. Happy to discuss specific challenges your team is facing!",
        helpful_votes: 15,
        unhelpful_votes: 0,
        quality_score: 0.95,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        responder: { full_name: "Dr. Jamie Rivera" }
      },
      {
        id: 'sample-human',
        source_type: 'human',
        content: demoQuestion ? 
          `Based on my experience improving ${demoQuestion}, here are some practical tips:\n\n1. Start by gathering data on your current state - you can't improve what you don't measure\n2. Talk to everyone involved in the process to understand pain points from multiple perspectives\n3. Look for small, incremental improvements rather than massive overhauls\n4. Test changes with a small group before rolling out widely\n5. Be patient - meaningful improvements take time\n\nWhen I was at Acme Corp, we faced similar challenges and found that a combination of process tweaks and better communication tools made a huge difference. Feel free to reach out if you want to discuss specific aspects of your situation!` : 
          "I've led engineering teams of 10-15 people for about 8 years now, and this balance is always challenging. Here's what's worked for me:\n\n1. **Protect maker time**: We block off Tuesdays and Thursdays as \"no meeting days\" for the entire team. This gives everyone predictable deep work time.\n\n2. **Outcome focus**: We've moved completely away from tracking hours or even days. We focus on sprint outcomes and make them realistic.\n\n3. **Rotation of on-call/support duties**: Nobody gets stuck always handling emergencies.\n\n4. **Mandatory vacation**: Everyone must take at least 2 consecutive weeks off annually. This forces knowledge sharing and prevents burnout.\n\n5. **Regular retrospectives**: We dedicate time to discuss not just what we're building but how we're working.\n\nThe biggest impact came from the no-meeting days. It took about 3 months for everyone to adjust, but productivity and happiness both improved dramatically.\n\nHappy to share more specific tactics if you're interested!",
        helpful_votes: 12,
        unhelpful_votes: 1,
        quality_score: 0.9,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        responder: { full_name: "Morgan Chen" },
        response_type: "strategic"
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDemoStage('question')}
            className="p-2 text-ink-light hover:text-ink-dark transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-medium text-ink-dark">Response Comparison</h1>
            <p className="text-ink-light">See different quality levels of responses</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Demo Mode</h3>
              <p className="text-blue-700 text-sm">
                This is a demonstration of how N-th`ora's expert matching works. You're seeing responses of varying quality levels to illustrate how our system helps you find the best answers. In the real platform, you'll connect with actual experts from your network.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {sampleResponses.map((response, index) => (
            <motion.div 
              key={response.id} 
              className={`border rounded-lg p-4 ${getResponseBackground(response)}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${response.source_type === 'agentic_human' ? 'bg-blue-100' : 'bg-surface-100'} rounded-full flex items-center justify-center`}>
                    {response.source_type === 'human' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-ink-dark">
                        {response.responder?.full_name || 'Anonymous'}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${response.source_type === 'agentic_human' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {response.source_type === 'human' ? 'Human' : 'AI Assistant'}
                      </span>
                    </div>
                    <p className="text-sm text-ink-light">{formatDate(response.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {response.response_type && (
                    <span className="bg-surface-100 text-ink-base px-2 py-1 rounded-full text-xs font-medium border border-surface-200 capitalize">
                      {response.response_type}
                    </span>
                  )}
                  {response.quality_level && getQualityLevelBadge(response.quality_level)}
                  {response.is_marked_helpful && (
                    <Star className="h-4 w-4 text-clay-500 fill-current" />
                  )}
                </div>
              </div>
              
              <div className="prose max-w-none text-ink-base mb-3">
                <p className="whitespace-pre-wrap">{response.content}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVoteResponse(response.id, true)}
                    className="flex items-center space-x-1 text-ink-light hover:text-sage-600 transition-colors duration-300"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-sm">{response.helpful_votes}</span>
                  </button>
                  <button
                    onClick={() => handleVoteResponse(response.id, false)}
                    className="flex items-center space-x-1 text-ink-light hover:text-blush-600 transition-colors duration-300"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span className="text-sm">{response.unhelpful_votes}</span>
                  </button>
                </div>
                
                {response.quality_score && (
                  <div className="text-sm text-ink-light">
                    Quality: {Math.round(response.quality_score * 100)}%
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setDemoStage('comparison')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            See How It Works
          </button>
        </div>
      </div>
    );
  };

  const renderComparisonStage = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setDemoStage('responses')}
          className="p-2 text-ink-light hover:text-ink-dark transition-colors duration-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-medium text-ink-dark">How N-th`ora Works</h1>
          <p className="text-ink-light">Our expert matching system explained</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-surface-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-ink-dark">Expert Matching System</h2>
            <p className="text-ink-light">How we find the right experts for your questions</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="font-medium text-purple-900 mb-2 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
              Question Analysis
            </h3>
            <p className="text-purple-700 text-sm mb-3">
              When you ask a question, our AI analyzes it to identify:
            </p>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start space-x-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Primary and secondary expertise areas needed</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Required answer type (tactical, strategic, etc.)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Urgency level and complexity</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Network Matching
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              We search your extended network for experts who:
            </p>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Have verified expertise in the required areas</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Have high-quality response history</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Are available and responsive</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-medium text-green-900 mb-2 flex items-center">
              <Star className="h-5 w-5 mr-2 text-green-600" />
              Quality Assurance
            </h3>
            <p className="text-green-700 text-sm mb-3">
              We ensure high-quality answers through:
            </p>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Peer endorsements and expertise validation</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Response quality scoring and feedback</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Helpful vote tracking and expert reputation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onComplete || (() => navigate('/dashboard'))}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-soft border border-surface-200 p-6 max-w-4xl w-full">
          <div className="animate-pulse">
            <div className="h-6 bg-surface-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-surface-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-surface-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-soft border border-surface-200 p-6 max-w-4xl w-full">
        {demoStage === 'intro' && renderIntroStage()}
        {demoStage === 'question' && renderQuestionStage()}
        {demoStage === 'responses' && renderResponsesStage()}
        {demoStage === 'comparison' && renderComparisonStage()}
      </div>
    </div>
  );
};

export default OnboardingDemo;