import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Palette,
  ArrowRight,
  MessageSquare,
  Grid3X3,
  ThumbsUp,
  Code,
  Download,
  Sparkles,
} from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    title: 'Describe',
    description: 'Tell us what you want to build. We ask a few quick questions to understand your vision.',
  },
  {
    icon: Grid3X3,
    title: 'Prototype',
    description: 'See 5 distinct design variants exploring different approaches - layout, style, density.',
  },
  {
    icon: ThumbsUp,
    title: 'Iterate',
    description: 'Give feedback, combine elements from different variants, refine until perfect.',
  },
  {
    icon: Code,
    title: 'Build',
    description: 'We generate production-ready code once you approve the design.',
  },
  {
    icon: Download,
    title: 'Export',
    description: 'Download as ZIP, push to GitHub, or deploy to Vercel with one click.',
  },
];

const comparisons = [
  {
    traditional: 'Generates ONE design immediately',
    ours: 'Generates 5 variants to explore',
  },
  {
    traditional: 'Iterate by regenerating (losing work)',
    ours: 'Iterate by combining best elements',
  },
  {
    traditional: "You don't know what you want until you see it",
    ours: 'See multiple options before committing',
  },
  {
    traditional: 'Each revision costs time and tokens',
    ours: 'Faster convergence with informed decisions',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <span className="font-semibold">Design IDE</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost">My Projects</Button>
            </Link>
            <Link href={`/projects/${Date.now()}`}>
              <Button>
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            Prototype-First Development
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            See 5 designs before you build one
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unlike v0 or Lovable that generate code immediately, we show you 5 visual
            prototypes first. Iterate until confident, then build.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href={`/projects/${Date.now()}`}>
              <Button size="lg">
                Start Building
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why prototype first?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-muted-foreground text-center">
                Traditional (v0, Lovable)
              </h3>
              {comparisons.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border bg-background text-sm"
                >
                  {item.traditional}
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-primary text-center">
                Design IDE
              </h3>
              {comparisons.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 text-sm"
                >
                  {item.ours}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-5 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Ready to build with confidence?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Stop regenerating. Start exploring. See 5 designs before you commit to one.
          </p>
          <Link href={`/projects/${Date.now()}`}>
            <Button size="lg" variant="secondary">
              Start Your First Project
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Palette className="h-4 w-4" />
            <span>Design IDE</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Prototype-first development for the AI era
          </p>
        </div>
      </footer>
    </div>
  );
}
