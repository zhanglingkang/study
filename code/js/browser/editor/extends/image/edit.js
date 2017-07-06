import React from 'react'
import {
    Input,
    Button,
    Modal,
    Checkbox,
    Form,
    InputNumber
} from 'antd'

@Form.create()
export default class ImageEdit extends React.Component {
    static propTypes = {}

    constructor(props) {
        super(props)
        this.state = {
            imgLoading: false,
            imgError: false
        }
    }

    onOk = () => {
        let {form} = this.props
        form.validateFields((err, values) => {
            if (!err && !this.state.imgError) {
                this.props.onOk(values)
                this.props.form.resetFields()
            }
        })
    }
    onCancel = () => {
        this.props.onCancel()
    }
    handleImgChange = (e) => {
        //requestAnimationFrame中执行，this.props.form.getFieldValue获取到的值才会发生变化
        //requestAnimationFrame(() => {
        //    let url = this.props.form.getFieldValue('img')
        //    let error = this.props.form.getFieldError('img')
        //    if (!error) {
        //        this.setState({
        //            imgLoading: true
        //        })
        //        let image = this.image = new Image()
        //        image.src = url
        //        image.onload = () => {
        //            this.setState({
        //                imgLoading: false,
        //                imgError: false
        //            })
        //            this.props.form.setFieldsValue({width: image.width})
        //        }
        //        image.onerror = () => {
        //            this.setState({
        //                imgLoading: false,
        //                imgError: true
        //            })
        //        }
        //    }
        //})
    }

    componentWillUnmount() {
        if (this.image) {
            this.image.onerror = this.image.onload = null
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.visible && !this.props.visible) {
            this.setState({
                imgError: false,
                imgLoading: false
            })
            if (nextProps.data) {
                this.props.form.setFieldsValue(nextProps.data)
            }
        }
    }

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }
        const tailFormItemLayout = {
            wrapperCol: {
                span: 14,
                offset: 6,
            }
        }
        const {imgLoading, imgError} = this.state
        let okText = imgLoading ? '加载中' : '确定'
        let imgItemProps = {}
        if (imgLoading) {
            imgItemProps.validateStatus = 'validating'
        } else if (imgError) {
            imgItemProps.validateStatus = 'error'
            imgItemProps.help = '图片加载错误'
        }
        return <Modal
            confirmLoading={imgLoading}
            okText={okText}
            visible={this.props.visible}
            onCancel={this.onCancel}
            onOk={this.onOk}
            title="图片">
            <Form>
                <Form.Item
                    {...formItemLayout}
                    {...imgItemProps}
                    required={true}
                    label="图片地址">
                    {
                        getFieldDecorator('img', {
                            rules: [{
                                type: 'url',
                                required: true,
                                message: '请填写正确的图片地址'
                            }],
                        })(
                            <Input placeholder="请填写cdn上的图片地址" onChange={this.handleImgChange}/>
                        )
                    }
                    <div><a target="_blank" href="//acms.alibaba-inc.com">CMS入口</a></div>
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    required={true}
                    label="图片宽度">
                    {getFieldDecorator('width', {
                        rules: [{
                            type: 'string',
                            required: true,
                            message: '请填写数字或百分数'
                        }],
                        initialValue: '100%'
                    })(
                        <Input placeholder="图片宽度"/>
                    )}

                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="跳转地址">
                    {getFieldDecorator('url', {
                        rules: [{
                            type: 'url',
                            message: '请填写正确的跳转地址'
                        }],
                    })(
                        <Input placeholder="点击图片跳转的地址"/>
                    )}

                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="打开新页面">
                    {getFieldDecorator('newPage', {
                        valuePropName: 'checked',
                        rules: []
                    })(
                        <Checkbox>是</Checkbox>
                    )}
                </Form.Item>
            </Form>
        </Modal>
    }
}
