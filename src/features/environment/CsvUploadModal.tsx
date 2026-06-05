import { useState } from 'react';
import { Form, Input, Modal, Upload, message } from 'antd';
import type { UploadFile } from 'antd';

interface CsvUploadModalProps {
  open: boolean;
  title: string;
  uploading?: boolean;
  onCancel: () => void;
  onSubmit: (values: { schemeName: string; file: File }) => void;
}

export function CsvUploadModal({ open, title, uploading = false, onCancel, onSubmit }: CsvUploadModalProps) {
  const [form] = Form.useForm<{ schemeName: string }>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const reset = () => {
    form.resetFields();
    setFileList([]);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const file = fileList[0]?.originFileObj;
    if (!file) {
      message.error('请先选择 CSV 文件');
      return;
    }
    onSubmit({ schemeName: values.schemeName, file });
  };

  return (
    <Modal
      title={`上传${title}`}
      open={open}
      confirmLoading={uploading}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="提交"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="schemeName" label="方案名称" rules={[{ required: true, message: '请输入方案名称' }]}>
          <Input placeholder="请输入方案名称" />
        </Form.Item>
        <Form.Item label="CSV 文件" required>
          <Upload
            accept=".csv,text/csv"
            fileList={fileList}
            maxCount={1}
            beforeUpload={(file) => {
              const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
              if (!isCsv) {
                message.error('只能上传 CSV 文件');
                return Upload.LIST_IGNORE;
              }
              setFileList([{ uid: file.uid, name: file.name, status: 'done', originFileObj: file }]);
              return false;
            }}
            onRemove={() => {
              setFileList([]);
            }}
          >
            <span className="ant-btn">选择文件</span>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
