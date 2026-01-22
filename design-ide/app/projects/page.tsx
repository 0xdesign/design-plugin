'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Palette,
  Plus,
  Search,
  Clock,
  MoreVertical,
  Folder,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProjectPhase } from '@/lib/db/types';

// Mock data for now - in production this would come from Supabase
const mockProjects = [
  {
    id: '1',
    name: 'SaaS Pricing Page',
    description: 'A modern pricing page with three tiers',
    phase: 'prototype' as ProjectPhase,
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Dashboard Layout',
    description: 'Analytics dashboard with charts and metrics',
    phase: 'iterate' as ProjectPhase,
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    name: 'Landing Page',
    description: 'Product landing page with hero section',
    phase: 'build' as ProjectPhase,
    updatedAt: new Date('2024-01-13'),
  },
];

const phaseColors: Record<ProjectPhase, string> = {
  describe: 'bg-gray-100 text-gray-800',
  prototype: 'bg-blue-100 text-blue-800',
  iterate: 'bg-purple-100 text-purple-800',
  build: 'bg-green-100 text-green-800',
  export: 'bg-orange-100 text-orange-800',
};

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = mockProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <span className="font-semibold">Design IDE</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Projects</h1>
            <p className="text-muted-foreground">
              Manage your design prototypes
            </p>
          </div>
          <Link href={`/projects/${Date.now()}`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Projects grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No projects found</h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Try a different search term'
                : "You haven't created any projects yet"}
            </p>
            {!searchQuery && (
              <Link href={`/projects/${Date.now()}`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first project
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Folder className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={phaseColors[project.phase]}>
                        {project.phase}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {project.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
