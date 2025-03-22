export enum FeishuItemType {
  REQUIREMENT = 'requirement',
  BUG = 'bug',
  TASK = 'task',
}

export interface FeishuProject {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  owner: FeishuUser;
  status: string;
}

export interface FeishuRequirement {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  creator: FeishuUser;
  assignee?: FeishuUser;
  project_id: string;
  attachments?: FeishuAttachment[];
  comments?: FeishuComment[];
  custom_fields?: Record<string, any>;
}

export interface FeishuBug {
  id: string;
  title: string;
  description: string;
  priority: string;
  severity: string;
  status: string;
  created_at: string;
  updated_at: string;
  creator: FeishuUser;
  assignee?: FeishuUser;
  project_id: string;
  attachments?: FeishuAttachment[];
  comments?: FeishuComment[];
  custom_fields?: Record<string, any>;
}

export interface FeishuTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  creator: FeishuUser;
  assignee?: FeishuUser;
  project_id: string;
  parent_id?: string;
  due_date?: string;
  attachments?: FeishuAttachment[];
  comments?: FeishuComment[];
  custom_fields?: Record<string, any>;
}

export interface FeishuUser {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
}

export interface FeishuAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
  creator: FeishuUser;
}

export interface FeishuComment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  creator: FeishuUser;
}
