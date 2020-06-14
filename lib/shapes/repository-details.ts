export enum RepositoryType {
  GITHUB,
}

export interface RepositoryDetails {
  type: RepositoryType;
  owner: string;
  repo: string;
}
