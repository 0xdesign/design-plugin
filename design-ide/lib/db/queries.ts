import { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  Project,
  Variant,
  Feedback,
  Message,
  GeneratedFile,
  InsertProject,
  InsertVariant,
  InsertFeedback,
  InsertMessage,
  InsertGeneratedFile,
  ProjectPhase,
} from './types';

type Client = SupabaseClient<Database>;

// Project queries
export async function getProjects(client: Client, userId: string) {
  const { data, error } = await client
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as Project[];
}

export async function getProject(client: Client, projectId: string) {
  const { data, error } = await client
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data as Project;
}

export async function createProject(client: Client, project: InsertProject) {
  const { data, error } = await client
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function updateProject(
  client: Client,
  projectId: string,
  updates: Partial<InsertProject>
) {
  const { data, error } = await client
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function updateProjectPhase(
  client: Client,
  projectId: string,
  phase: ProjectPhase
) {
  return updateProject(client, projectId, { phase });
}

export async function deleteProject(client: Client, projectId: string) {
  const { error } = await client.from('projects').delete().eq('id', projectId);

  if (error) throw error;
}

// Variant queries
export async function getVariants(client: Client, projectId: string) {
  const { data, error } = await client
    .from('variants')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Variant[];
}

export async function getVariant(
  client: Client,
  projectId: string,
  variantId: string
) {
  const { data, error } = await client
    .from('variants')
    .select('*')
    .eq('project_id', projectId)
    .eq('variant_id', variantId)
    .single();

  if (error) throw error;
  return data as Variant;
}

export async function createVariant(client: Client, variant: InsertVariant) {
  const { data, error } = await client
    .from('variants')
    .insert(variant)
    .select()
    .single();

  if (error) throw error;
  return data as Variant;
}

export async function upsertVariant(client: Client, variant: InsertVariant) {
  const { data, error } = await client
    .from('variants')
    .upsert(variant, {
      onConflict: 'project_id,variant_id',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Variant;
}

export async function approveVariant(
  client: Client,
  projectId: string,
  variantId: string
) {
  // First, unapprove all variants for this project
  await client
    .from('variants')
    .update({ is_approved: false })
    .eq('project_id', projectId);

  // Then approve the selected variant
  const { data, error } = await client
    .from('variants')
    .update({ is_approved: true })
    .eq('project_id', projectId)
    .eq('variant_id', variantId)
    .select()
    .single();

  if (error) throw error;
  return data as Variant;
}

export async function deleteVariants(client: Client, projectId: string) {
  const { error } = await client
    .from('variants')
    .delete()
    .eq('project_id', projectId);

  if (error) throw error;
}

// Feedback queries
export async function getFeedback(client: Client, projectId: string) {
  const { data, error } = await client
    .from('feedback')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Feedback[];
}

export async function createFeedback(client: Client, feedback: InsertFeedback) {
  const { data, error } = await client
    .from('feedback')
    .insert(feedback)
    .select()
    .single();

  if (error) throw error;
  return data as Feedback;
}

export async function deleteFeedback(client: Client, feedbackId: string) {
  const { error } = await client.from('feedback').delete().eq('id', feedbackId);

  if (error) throw error;
}

export async function clearFeedback(client: Client, projectId: string) {
  const { error } = await client
    .from('feedback')
    .delete()
    .eq('project_id', projectId);

  if (error) throw error;
}

// Message queries
export async function getMessages(client: Client, projectId: string) {
  const { data, error } = await client
    .from('messages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Message[];
}

export async function createMessage(client: Client, message: InsertMessage) {
  const { data, error } = await client
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export async function clearMessages(client: Client, projectId: string) {
  const { error } = await client
    .from('messages')
    .delete()
    .eq('project_id', projectId);

  if (error) throw error;
}

// Generated files queries
export async function getGeneratedFiles(client: Client, projectId: string) {
  const { data, error } = await client
    .from('generated_files')
    .select('*')
    .eq('project_id', projectId)
    .order('path', { ascending: true });

  if (error) throw error;
  return data as GeneratedFile[];
}

export async function createGeneratedFile(
  client: Client,
  file: InsertGeneratedFile
) {
  const { data, error } = await client
    .from('generated_files')
    .insert(file)
    .select()
    .single();

  if (error) throw error;
  return data as GeneratedFile;
}

export async function upsertGeneratedFiles(
  client: Client,
  files: InsertGeneratedFile[]
) {
  const { data, error } = await client
    .from('generated_files')
    .upsert(files, {
      onConflict: 'project_id,path',
    })
    .select();

  if (error) throw error;
  return data as GeneratedFile[];
}

export async function clearGeneratedFiles(client: Client, projectId: string) {
  const { error } = await client
    .from('generated_files')
    .delete()
    .eq('project_id', projectId);

  if (error) throw error;
}
