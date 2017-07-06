import React from 'react'
import {
    genKey,
    CharacterMetadata,
    ContentBlock,
    convertToRaw,
    AtomicBlockUtils
} from 'draft-js'
import ImageEdit from './edit'
import {
    insertAtomicBlock,
    replaceEntityData,
    getEntity
} from '../../util'

import './index.less'

class ImageComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false
        }
    }

    handleClick = () => {
        this.setState({
            visible: true
        })
    }
    handleOk = (data) => {
        let {contentBlock, editorState, onChange} = this.props.blockProps
        onChange(replaceEntityData(editorState, contentBlock.getEntityAt(0), data))
        this.setState({
            visible: false
        })
    }
    handleCancel = () => {
        this.setState({
            visible: false
        })
    }

    render() {
        let {visible} = this.state
        let {contentBlock, editorState} = this.props.blockProps
        const entity = getEntity(editorState, contentBlock)
        const data = entity.getData()
        return <div className="img-wrapper">
            <img onClick={this.handleClick} width={data.width} style={{maxWidth: '100%'}} src={data.img}></img>
            <ImageEdit
                data={data}
                visible={visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}/>
        </div>
    }
}

const ENTITY_TYPE = 'IMAGE'
export default class Image extends React.Component {
    static propTypes = {}
    static ENTITY_TYPE = ENTITY_TYPE
    static customBlockRenderFunc = function ({editorState, contentBlock, onChange}) {
        const type = contentBlock.getType()
        const entity = getEntity(editorState, contentBlock)
        const data = entity.getData()
        if (type === 'atomic' && entity.getType() === ENTITY_TYPE) {
            return {
                component: ImageComponent,
                editable: false,
                props: {
                    editorState,
                    contentBlock,
                    onChange
                }
            }
        }
    }
    static toHTML = function (content, entity) {
        const data = entity.getData()
        return `<table>
            <tr>
                <td><img width="${data.width}" style="max-width:100%;" src="${data.img}"/></td>
            </tr>
        </table>`
    }

    constructor(props) {
        super(props)
        this.state = {
            visible: false
        }
    }

    handleClick = () => {
        this.setState({
            visible: true
        })
    }
    handleCancel = () => {
        this.setState({
            visible: false
        })
    }
    handleOk = (data) => {
        let {editorState} = this.props
        this.props.onChange(insertAtomicBlock(editorState, {
            type: ENTITY_TYPE,
            immutable: 'IMMUTABLE',
            data
        }))
        this.setState({
            visible: false
        })
    }

    render() {
        //let content = <div>
        //    <Input placeholder="请输入图片路径" ref="input"/>
        //    <Button onClick={this.handleClick}>确认</Button>
        //</div>
        //return <Popover title="添加图片" content={content} trigger="click">
        //    <span>图片</span>
        //</Popover>
        let {visible} = this.state
        return <div className="toolbar-btn" onClick={this.handleClick}>
            图片
            <ImageEdit visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}/>
        </div>
    }
}