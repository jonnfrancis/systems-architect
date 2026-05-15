export interface ProjectOwnerSummary {
  id: string;
  email: string | null;
  displayName: string | null;
  imageUrl: string | null;
}

export interface CollaboratorSummary {
  id: string;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface CollaboratorsResponse {
  owner: ProjectOwnerSummary;
  collaborators: CollaboratorSummary[];
  canManage: boolean;
}
