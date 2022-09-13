import services from '@/services/demo';
import {
  deploy,
} from '@/services/demo/UserController';
import { queryBranchList, queryRepoList } from '@/services/github';
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProColumns,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Divider, Drawer, message, Modal, Select, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm, { FormValueType } from './components/UpdateForm';

const { addUser, deleteUser, modifyUser } = services.UserController;

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: GitHubAPI.Repo) => {
  const hide = message.loading('正在添加');
  try {
    await addUser({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};

/**
 * 更新节点
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('正在配置');
  try {
    await modifyUser(
      {
        userId: fields.id || '',
      },
      {
        name: fields.name || '',
        nickName: fields.nickName || '',
        email: fields.email || '',
      },
    );
    hide();

    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
    return false;
  }
};

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: GitHubAPI.Repo[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await deleteUser({
      userId: String(selectedRows.find((row) => row.id)?.id || ''),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const TableList: React.FC<unknown> = () => {
  const { initialState } = useModel('@@initialState');

  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] =
    useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<GitHubAPI.Repo>();
  const [selectedRowsState, setSelectedRows] = useState<GitHubAPI.Repo[]>([]);
  const columns: ProColumns<GitHubAPI.Repo>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      tip: '名称是唯一的 key',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '名称为必填项',
          },
        ],
      },
      render(dom, entity) {
        return (
          <a target="_blank" href={entity.html_url} rel="noreferrer">
            {dom}
          </a>
        );
      },
    },
    {
      title: '语言',
      dataIndex: 'language',
      render(dom) {
        return <Tag color="#87d068">{dom}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'date',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      valueType: 'date',
    },
    {
      title: '上次推送',
      dataIndex: 'pushed_at',
      valueType: 'dateTime',
      sorter: (a, b) =>
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(),
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setStepFormValues(record);
            }}
          >
            配置
          </a>
          <Divider type="vertical" />
          <a
            onClick={async () => {
              const Content = ({ onChange }: any) => {
                const [branchs, setBranchs] = useState<any[]>([]);

                const fetchBranchs = async () => {
                  const res = await queryBranchList({ owner: initialState?.owner || '', repo: record.name});
                  setBranchs(res || []);
                };
                useEffect(() => {
                  fetchBranchs();
                }, []);
                return (
                  <Select onChange={onChange} style={{ width: 200 }}>
                    {branchs.map((b) => (
                      <Select.Option key={b.name} value={b.name}>
                        {b.name}
                      </Select.Option>
                    ))}
                  </Select>
                );
              };
              let val = '';
              Modal.confirm({
                title: `选择分支:(${record.name})`,
                content: <Content onChange={(v: string) => (val = v)} />,
                async onOk() {
                  await deploy({
                    name: record.name,
                    url: record.ssh_url,
                    branch: val,
                    sprintId: '002',
                  });
                },
              });
            }}
          >
            部署
          </a>
        </>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: 'Github 仓库',
      }}
    >
      <ProTable<GitHubAPI.Repo>
        headerTitle="仓库列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        pagination={{
          pageSize: 10,
        }}
        toolBarRender={() => [
          <Button
            key="1"
            type="primary"
            onClick={() => handleModalVisible(true)}
          >
            新建
          </Button>,
        ]}
        request={async (params, sorter, filter) => {
          if (!initialState?.owner) {
            return {
              data: [],
            }
          }
          const res = await queryRepoList({
            ...params,
            // FIXME: remove @ts-ignore
            // @ts-ignore
            sorter,
            filter,
            owner: initialState.owner,
          });
          return {
            data: res || [],
            success: true,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              项&nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
          <Button type="primary">批量审批</Button>
        </FooterToolbar>
      )}
      <CreateForm
        onCancel={() => handleModalVisible(false)}
        modalVisible={createModalVisible}
      >
        <ProTable<GitHubAPI.Repo, GitHubAPI.Repo>
          onSubmit={async (value) => {
            const success = await handleAdd(value);
            if (success) {
              handleModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          rowKey="id"
          type="form"
          columns={columns}
        />
      </CreateForm>
      {stepFormValues && Object.keys(stepFormValues).length ? (
        <UpdateForm
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalVisible(false);
              setStepFormValues({});
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues({});
          }}
          updateModalVisible={updateModalVisible}
          values={stepFormValues}
        />
      ) : null}

      <Drawer
        width={600}
        visible={!!row}
        onClose={() => {
          setRow(undefined);
        }}
        closable={false}
      >
        {row?.name && (
          <ProDescriptions<GitHubAPI.Repo>
            column={2}
            title={row?.name}
            request={async () => ({
              data: row || {},
            })}
            params={{
              id: row?.name,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
