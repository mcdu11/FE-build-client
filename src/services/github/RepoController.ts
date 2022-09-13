import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/v1/queryUserList */
export async function queryRepoList(
  params: {
    owner: string;
  },
  options?: { [key: string]: any },
) {
  return request<GitHubAPI.Repo[]>(`/github/users/${params.owner}/repos`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/v1/queryUserList */
export async function queryBranchList(
  params: {
    owner: string;
    repo: string;
  },
  options?: { [key: string]: any },
) {
  return request<GitHubAPI.Branch[]>(
    `/github/repos/${params.owner}/${params.repo}/branches`,
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}
