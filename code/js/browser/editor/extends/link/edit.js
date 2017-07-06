import  React from 'react';
import {
    Input,
    Checkbox,
    Form,
    Modal
} from 'antd';

@Form.create()
export default class LinkEdit extends React.Component {
    constructor(props) {
        super(props)
        this.state = {};

        ['onOk', 'onCancel'].forEach(method => {
            this[method] = this[method].bind(this);
        });
    }

    onOk() {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.onOk(values);
                this.props.form.resetFields();
            }
        });
    }

    onCancel() {
        this.props.onCancel();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.visible && !this.props.visible) {
            if (nextProps.data) {
                this.props.form.setFieldsValue(nextProps.data)
            }
        }
    }

    render() {

        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 16},
        };
        let showClass = location.href.indexOf('showClass') !== -1

        return (
            <Modal
                visible={this.props.visible}
                onOk={this.onOk}
                onCancel={this.onCancel}
                title="链接">
                <Form>
                    <Form.Item
                        {...formItemLayout}
                        required={true}
                        label="跳转地址">
                        {getFieldDecorator('href', {
                            rules: [{
                                type: 'string',
                                required: true,
                                message: '请填写正确的跳转地址'
                            }],
                        })(
                            <Input placeholder="跳转地址"/>
                        )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="打开新页面">
                        {getFieldDecorator('newPage', {
                            valuePropName: 'checked',
                            rules: [],
                        })(
                            <Checkbox>是</Checkbox>
                        )}
                    </Form.Item>
                    <Form.Item
                        style={{display: showClass ? 'block' : 'none'}}
                        {...formItemLayout}
                        label="class">
                        {getFieldDecorator('className', {
                            rules: [{
                                message: '请填写链接class'
                            }],
                        })(
                            <Input placeholder="链接class"/>
                        )}
                    </Form.Item>

                </Form>
            </Modal>
        );
    }
}