<script lang="ts">
  import { onMount } from 'svelte';
  
  let isMenuOpen = false;
  let scrolled = false;
  
  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 20;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<div class="min-h-screen bg-white text-black">
  <!-- Navigation -->
  <nav class="fixed top-0 w-full z-50 transition-all duration-300 {scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100' : 'bg-transparent'}">
    <div class="max-w-7xl mx-auto px-6 py-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-black tracking-tighter">NEXUS</h1>
        
        <div class="hidden md:flex items-center gap-12">
          <a href="#features" class="text-sm font-medium hover:text-gray-600 transition">Features</a>
          <a href="#solutions" class="text-sm font-medium hover:text-gray-600 transition">Solutions</a>
          <a href="#pricing" class="text-sm font-medium hover:text-gray-600 transition">Pricing</a>
          <button class="bg-black text-white px-6 py-2 text-sm font-bold hover:bg-gray-800 transition">
            Get Started
          </button>
        </div>
        
        <button 
          class="md:hidden"
          on:click={() => isMenuOpen = !isMenuOpen}
          aria-label="Toggle menu"
        >
          <div class="space-y-1.5">
            <span class="block w-6 h-0.5 bg-black transition-all {isMenuOpen ? 'rotate-45 translate-y-2' : ''}"></span>
            <span class="block w-6 h-0.5 bg-black transition-all {isMenuOpen ? 'opacity-0' : ''}"></span>
            <span class="block w-6 h-0.5 bg-black transition-all {isMenuOpen ? '-rotate-45 -translate-y-2' : ''}"></span>
          </div>
        </button>
      </div>
    </div>
    
    {#if isMenuOpen}
      <div class="md:hidden bg-white border-t border-gray-100">
        <div class="px-6 py-4 space-y-4">
          <a href="#features" class="block text-sm font-medium">Features</a>
          <a href="#solutions" class="block text-sm font-medium">Solutions</a>
          <a href="#pricing" class="block text-sm font-medium">Pricing</a>
          <button class="w-full bg-black text-white py-2 text-sm font-bold">
            Get Started
          </button>
        </div>
      </div>
    {/if}
  </nav>

  <!-- Hero Section -->
  <section class="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-gray-50 to-white">
    <div class="max-w-5xl mx-auto text-center">
      <h2 class="text-6xl md:text-8xl font-black leading-none mb-8">
        AI THAT<br/>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-400">
          DELIVERS
        </span>
      </h2>
      <p class="text-xl md:text-2xl font-light text-gray-600 mb-12 max-w-2xl mx-auto">
        Next-generation AI infrastructure for enterprises. 
        Simple. Powerful. Scalable.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="bg-black text-white px-10 py-4 text-lg font-bold hover:bg-gray-800 transition">
          Start Free Trial
        </button>
        <button class="border-2 border-black px-10 py-4 text-lg font-bold hover:bg-black hover:text-white transition">
          Watch Demo
        </button>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-32 px-6">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-5xl md:text-7xl font-black mb-20">FEATURES</h2>
      
      <div class="grid md:grid-cols-2 gap-20">
        <div class="space-y-12">
          <div class="border-l-4 border-black pl-8">
            <h3 class="text-3xl font-bold mb-4">Lightning Fast</h3>
            <p class="text-gray-600 text-lg">Process millions of documents in seconds. Real-time analysis at scale.</p>
          </div>
          
          <div class="border-l-4 border-black pl-8">
            <h3 class="text-3xl font-bold mb-4">Zero Setup</h3>
            <p class="text-gray-600 text-lg">Deploy in minutes, not months. No infrastructure headaches.</p>
          </div>
        </div>
        
        <div class="space-y-12">
          <div class="border-l-4 border-black pl-8">
            <h3 class="text-3xl font-bold mb-4">99.9% Accurate</h3>
            <p class="text-gray-600 text-lg">Industry-leading accuracy powered by cutting-edge AI models.</p>
          </div>
          
          <div class="border-l-4 border-black pl-8">
            <h3 class="text-3xl font-bold mb-4">Bank-Level Security</h3>
            <p class="text-gray-600 text-lg">Your data is encrypted, isolated, and protected 24/7.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Solutions Section -->
  <section id="solutions" class="py-32 px-6 bg-black text-white">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-5xl md:text-7xl font-black mb-20">SOLUTIONS</h2>
      
      <div class="grid md:grid-cols-3 gap-12">
        <div class="bg-white text-black p-12 group hover:scale-105 transition-transform">
          <h3 class="text-2xl font-bold mb-4">Customer Intelligence</h3>
          <p class="text-gray-600 mb-8">Understand your customers with AI-powered behavioral analysis.</p>
          <span class="text-4xl font-black">→</span>
        </div>
        
        <div class="bg-white text-black p-12 group hover:scale-105 transition-transform">
          <h3 class="text-2xl font-bold mb-4">Process Automation</h3>
          <p class="text-gray-600 mb-8">Automate complex workflows with intelligent decision making.</p>
          <span class="text-4xl font-black">→</span>
        </div>
        
        <div class="bg-white text-black p-12 group hover:scale-105 transition-transform">
          <h3 class="text-2xl font-bold mb-4">Predictive Analytics</h3>
          <p class="text-gray-600 mb-8">Forecast trends and opportunities with advanced ML models.</p>
          <span class="text-4xl font-black">→</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-32 px-6 bg-gray-50">
    <div class="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-center">
      <div>
        <div class="text-6xl font-black mb-2">25M+</div>
        <div class="text-gray-600">API Calls Daily</div>
      </div>
      <div>
        <div class="text-6xl font-black mb-2">1,200+</div>
        <div class="text-gray-600">Enterprise Clients</div>
      </div>
      <div>
        <div class="text-6xl font-black mb-2">99.99%</div>
        <div class="text-gray-600">Uptime SLA</div>
      </div>
      <div>
        <div class="text-6xl font-black mb-2">&lt;20ms</div>
        <div class="text-gray-600">Response Time</div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-32 px-6">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-5xl md:text-7xl font-black mb-8">
        READY TO<br/>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-400">
          INNOVATE?
        </span>
      </h2>
      <p class="text-xl text-gray-600 mb-12">
        Join 1,200+ companies transforming with NEXUS AI
      </p>
      <button class="bg-black text-white px-12 py-5 text-xl font-bold hover:bg-gray-800 transition">
        Start Building Today
      </button>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-gray-200 py-12 px-6">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
      <div class="mb-4 md:mb-0">
        <h3 class="text-2xl font-black">NEXUS</h3>
        <p class="text-gray-600 mt-2">AI Infrastructure for Tomorrow</p>
      </div>
      <div class="flex gap-8 text-sm">
        <a href="/privacy" class="hover:text-gray-600 transition">Privacy</a>
        <a href="/terms" class="hover:text-gray-600 transition">Terms</a>
        <a href="/contact" class="hover:text-gray-600 transition">Contact</a>
      </div>
    </div>
  </footer>
</div>

<style>
  /* Custom animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  section {
    animation: fadeIn 0.8s ease-out;
  }
</style>