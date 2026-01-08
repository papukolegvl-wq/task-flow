export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus = 'backlog' | 'in_progress' | 'waiting' | 'done' | 'canceled' | 'blocked';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'file' | 'link';
  addedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string; // For now just 'user'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  parentId: string | null;
  subtaskIds: string[];
  dependencyIds: string[];
  tags: string[];
  dueDate: string | null;
  startDate: string | null;
  completedAt: string | null;
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'list' | 'board';
