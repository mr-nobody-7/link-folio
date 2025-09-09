import { Button } from "@/components/ui/button";
import AppNavBar from "@/components/common/AppNavBar";
import Link from "next/link";

/**
 * Enhanced Landing page for LinkFolio using the new color palette.
 * Features improved design with white, black, red (Flamingo), yellow (Salomie), and gray tones.
 */

// Features for highlight section
const FEATURES = [
  {
    title: "No Code Required",
    desc: "Just drag, drop, and go. No tech skills necessary!",
    icon: "🚀",
  },
  {
    title: "Custom Themes",
    desc: "Personalize your bio with unique colors and styles.",
    icon: "🎨",
  },
  {
    title: "Instant Setup",
    desc: "Create and share your link-in-bio in seconds.",
    icon: "⚡",
  },
];

// (Example) Testimonial
const TESTIMONIAL = {
  quote: "Finally a bio tool that makes my links look as good as my content!",
  user: "Alex, Creator & Marketer",
};

export default function HomePage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-white">
      <AppNavBar />
      <main className="flex-1 w-full flex flex-col justify-center items-center px-4">
        {/* Hero Section */}
        <section className="w-full max-w-6xl mx-auto mt-12 md:mt-20">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-[#fcd687] text-black text-sm font-semibold rounded-full mb-4">
                ✨ Join 5,800+ creators
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 font-heading tracking-tight text-black leading-tight">
              LinkFolio
            </h1>
            <p className="text-xl md:text-2xl text-[#504d46] mb-4 leading-relaxed font-sans max-w-3xl">
              Build your own beautiful link-in-bio site in seconds.
            </p>
            <p className="text-lg md:text-xl text-black mb-8 font-semibold">
              No code. Just you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="!px-8 !py-4 w-full sm:w-auto font-bold text-lg rounded-full bg-[#ec5c33] hover:bg-[#d54a29] text-white border-none shadow-lg transform hover:scale-105 transition-all duration-200">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="!px-8 !py-4 w-full sm:w-auto font-bold text-lg rounded-full shadow-lg"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full max-w-6xl mx-auto mt-20 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 font-heading">
              Why creators choose LinkFolio
            </h2>
            <p className="text-lg text-[#504d46] max-w-2xl mx-auto">
              Everything you need to create a stunning link-in-bio that converts
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-white border-2 border-[#888888]/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-3 font-heading">
                  {feature.title}
                </h3>
                <p className="text-[#504d46] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="w-full max-w-4xl mx-auto mb-16">
          <div className="flex flex-wrap justify-center gap-8">
            <div className="bg-white border-2 border-[#fcd687] px-8 py-6 rounded-2xl shadow-lg flex flex-col items-center min-w-[150px]">
              <span className="text-3xl font-bold text-[#ec5c33]">5,800+</span>
              <span className="text-[#504d46] text-sm font-medium">
                Active Users
              </span>
            </div>
            <div className="bg-white border-2 border-[#fcd687] px-8 py-6 rounded-2xl shadow-lg flex flex-col items-center min-w-[150px]">
              <span className="text-3xl font-bold text-[#ec5c33]">900k+</span>
              <span className="text-[#504d46] text-sm font-medium">
                Links Created
              </span>
            </div>
            <div className="bg-white border-2 border-[#fcd687] px-8 py-6 rounded-2xl shadow-lg flex flex-col items-center min-w-[150px]">
              <span className="text-3xl font-bold text-[#ec5c33]">4.9/5</span>
              <span className="text-[#504d46] text-sm font-medium">
                User Rating
              </span>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="w-full max-w-4xl mx-auto mb-16">
          <div className="bg-[#fcd687]/20 border-2 border-[#fcd687] rounded-3xl p-8 md:p-12 text-center">
            <div className="text-4xl mb-6">💬</div>
            <blockquote className="text-xl md:text-2xl font-semibold text-black mb-6 italic font-heading">
              {TESTIMONIAL.quote}
            </blockquote>
            <cite className="text-[#504d46] font-medium">
              — {TESTIMONIAL.user}
            </cite>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-[#ec5c33] to-[#fcd687] rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
              Ready to build your LinkFolio?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join thousands of creators who trust LinkFolio for their
              link-in-bio needs
            </p>
            <Link href="/signup">
              <Button className="!px-10 !py-4 font-bold text-lg rounded-full bg-white text-[#ec5c33] hover:bg-gray-100 border-none shadow-lg transform hover:scale-105 transition-all duration-200">
                Start Building Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Updated Footer */}
        <footer className="w-full text-center pb-8 text-[#888888] text-sm">
          <div className="border-t border-[#888888]/20 pt-8 max-w-6xl mx-auto">
            <p>
              &copy; {new Date().getFullYear()} LinkFolio. Crafted with{" "}
              <span className="text-[#ec5c33]">♥</span> for creators
            </p>
            <div className="flex justify-center items-center gap-4 mt-4">
              <a
                href="#"
                className="text-[#888888] hover:text-[#ec5c33] transition-colors"
              >
                Privacy
              </a>
              <span className="text-[#888888]/50">•</span>
              <a
                href="#"
                className="text-[#888888] hover:text-[#ec5c33] transition-colors"
              >
                Terms
              </a>
              <span className="text-[#888888]/50">•</span>
              <a
                href="https://github.com/"
                className="text-[#888888] hover:text-[#ec5c33] transition-colors"
                target="_blank"
                rel="noopener"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
