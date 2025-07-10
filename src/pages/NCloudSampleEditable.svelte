<script lang="ts">
  import HtmlEditor from '../lib/features/html-parser/HtmlEditor.svelte';
  
  // The original template as HTML string
  const templateHtml = `
    <div class="min-h-screen bg-white text-black">
      <!-- Navigation -->
      <nav class="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-black tracking-tight">NEXUS</h1>
            
            <div class="hidden md:flex items-center gap-8">
              <a href="#features" class="text-sm font-medium hover:text-gray-600 transition">Features</a>
              <a href="#solutions" class="text-sm font-medium hover:text-gray-600 transition">Solutions</a>
              <a href="#pricing" class="text-sm font-medium hover:text-gray-600 transition">Pricing</a>
              <button class="bg-black text-white px-6 py-2 text-sm font-semibold rounded hover:bg-gray-800 transition">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="pt-20 pb-32 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div class="max-w-6xl mx-auto text-center">
          <h2 class="text-5xl md:text-7xl font-black leading-tight mb-8">
            AI THAT<br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500">
              DELIVERS
            </span>
          </h2>
          <p class="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Next-generation AI infrastructure for enterprises. 
            Simple. Powerful. Scalable.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button class="bg-black text-white px-8 py-4 text-lg font-semibold rounded hover:bg-gray-800 transition">
              Start Free Trial
            </button>
            <button class="border-2 border-black px-8 py-4 text-lg font-semibold rounded hover:bg-black hover:text-white transition">
              Watch Demo
            </button>
          </div>
          
          <!-- Hero Image -->
          <div class="mt-12">
            <img 
              src="https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1000&h=600&fit=crop" 
              alt="AI Technology Dashboard"
              class="rounded-xl shadow-2xl mx-auto max-w-full"
            />
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-24 px-6">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-4xl md:text-6xl font-black mb-16 text-center">FEATURES</h2>
          
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="border border-gray-200 p-8 rounded-lg hover:shadow-lg transition-shadow" data-editable="repeat">
              <div class="flex items-center gap-4 mb-6">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <h3 class="text-xl font-bold">Lightning Fast</h3>
              </div>
              <p class="text-gray-600">Process millions of documents in seconds with real-time analysis.</p>
            </div>
            
            <div class="border border-gray-200 p-8 rounded-lg hover:shadow-lg transition-shadow" data-editable="repeat">
              <div class="flex items-center gap-4 mb-6">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <h3 class="text-xl font-bold">Zero Setup</h3>
              </div>
              <p class="text-gray-600">Deploy in minutes, not months. No infrastructure headaches.</p>
            </div>
            
            <div class="border border-gray-200 p-8 rounded-lg hover:shadow-lg transition-shadow" data-editable="repeat">
              <div class="flex items-center gap-4 mb-6">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-purple-600">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
                <h3 class="text-xl font-bold">99.9% Accurate</h3>
              </div>
              <p class="text-gray-600">Industry-leading accuracy powered by cutting-edge AI models.</p>
            </div>
            
            <div class="border border-gray-200 p-8 rounded-lg hover:shadow-lg transition-shadow" data-editable="repeat">
              <div class="flex items-center gap-4 mb-6">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-600">
                  <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
                <h3 class="text-xl font-bold">Bank-Level Security</h3>
              </div>
              <p class="text-gray-600">Your data is encrypted, isolated, and protected 24/7.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Icons Section -->
      <section class="py-24 px-6 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-4xl md:text-6xl font-black mb-16 text-center">INTEGRATIONS</h2>
          
          <div class="grid md:grid-cols-3 lg:grid-cols-6 gap-8">
            <div class="flex flex-col items-center p-6 bg-white rounded-lg hover:shadow-md transition-shadow" data-editable="repeat">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-500 mb-4">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h3 class="text-lg font-semibold">Documents</h3>
            </div>
            
            <div class="flex flex-col items-center p-6 bg-white rounded-lg hover:shadow-md transition-shadow" data-editable="repeat">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-500 mb-4">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <h3 class="text-lg font-semibold">Analytics</h3>
            </div>
            
            <div class="flex flex-col items-center p-6 bg-white rounded-lg hover:shadow-md transition-shadow" data-editable="repeat">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-purple-500 mb-4">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <h3 class="text-lg font-semibold">Global</h3>
            </div>
            
            <div class="flex flex-col items-center p-6 bg-white rounded-lg hover:shadow-md transition-shadow" data-editable="repeat">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-orange-500 mb-4">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"></path>
              </svg>
              <h3 class="text-lg font-semibold">Security</h3>
            </div>
            
            <div class="flex flex-col items-center p-6 bg-white rounded-lg hover:shadow-md transition-shadow" data-editable="repeat">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500 mb-4">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <h3 class="text-lg font-semibold">Health</h3>
            </div>
            
            <div class="flex flex-col items-center p-6 bg-white rounded-lg hover:shadow-md transition-shadow" data-editable="repeat">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-teal-500 mb-4">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <h3 class="text-lg font-semibold">Learning</h3>
            </div>
          </div>
        </div>
      </section>

      <!-- Solutions Section -->
      <section id="solutions" class="py-24 px-6 bg-black text-white">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-4xl md:text-6xl font-black mb-16 text-center">SOLUTIONS</h2>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white text-black p-8 rounded-lg group hover:scale-105 transition-transform" data-editable="repeat">
              <h3 class="text-2xl font-bold mb-4">Customer Intelligence</h3>
              <p class="text-gray-600 mb-6">Understand your customers with AI-powered behavioral analysis and insights.</p>
              <span class="text-3xl font-black text-blue-600">→</span>
            </div>
            
            <div class="bg-white text-black p-8 rounded-lg group hover:scale-105 transition-transform" data-editable="repeat">
              <h3 class="text-2xl font-bold mb-4">Process Automation</h3>
              <p class="text-gray-600 mb-6">Automate complex workflows with intelligent decision making capabilities.</p>
              <span class="text-3xl font-black text-green-600">→</span>
            </div>
            
            <div class="bg-white text-black p-8 rounded-lg group hover:scale-105 transition-transform" data-editable="repeat">
              <h3 class="text-2xl font-bold mb-4">Predictive Analytics</h3>
              <p class="text-gray-600 mb-6">Forecast trends and opportunities with advanced machine learning models.</p>
              <span class="text-3xl font-black text-purple-600">→</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="py-24 px-6 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-4xl md:text-6xl font-black mb-16 text-center">BY THE NUMBERS</h2>
          <div class="grid md:grid-cols-4 gap-8 text-center">
            <div class="p-6">
              <div class="text-5xl font-black mb-2 text-blue-600">25M+</div>
              <div class="text-gray-600 text-lg">API Calls Daily</div>
            </div>
            <div class="p-6">
              <div class="text-5xl font-black mb-2 text-green-600">1,200+</div>
              <div class="text-gray-600 text-lg">Enterprise Clients</div>
            </div>
            <div class="p-6">
              <div class="text-5xl font-black mb-2 text-purple-600">99.99%</div>
              <div class="text-gray-600 text-lg">Uptime SLA</div>
            </div>
            <div class="p-6">
              <div class="text-5xl font-black mb-2 text-red-600">&lt;20ms</div>
              <div class="text-gray-600 text-lg">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-24 px-6">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-4xl md:text-6xl font-black mb-8">
            READY TO<br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500">
              INNOVATE?
            </span>
          </h2>
          <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Join 1,200+ companies already transforming their business with NEXUS AI
          </p>
          <button class="bg-black text-white px-10 py-4 text-xl font-semibold rounded hover:bg-gray-800 transition">
            Start Building Today
          </button>
        </div>
      </section>

      <!-- Footer -->
      <footer class="border-t border-gray-200 py-12 px-6">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="mb-6 md:mb-0">
              <h3 class="text-2xl font-black mb-2">NEXUS</h3>
              <p class="text-gray-600">AI Infrastructure for Tomorrow</p>
            </div>
            <div class="flex gap-8 text-sm">
              <a href="/privacy" class="hover:text-gray-600 transition">Privacy Policy</a>
              <a href="/terms" class="hover:text-gray-600 transition">Terms of Service</a>
              <a href="/contact" class="hover:text-gray-600 transition">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `;
</script>

<div class="editor-container">
  <HtmlEditor html={templateHtml} />
</div>

<style>
  .editor-container {
    position: relative;
  }
</style>