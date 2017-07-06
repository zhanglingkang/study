import React from 'react'
import {
    genKey,
    CharacterMetadata,
    ContentBlock,
    convertToRaw,
    AtomicBlockUtils,
} from 'draft-js'
import LinkEdit from './edit'
import {
    insertAtomicBlock,
    replaceEntityData,
    getEntity,
    getSelectionInlineStyle,
    getSelectionEntity2,
    getSelectionText,
    applyEntity,
    getFindEntityStrategy
} from '../../util'

import {
    Popover,
    Icon
} from 'antd'


class LinkComponent extends React.Component {
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
        const {entityKey, editorState, onChange} = this.props
        onChange(replaceEntityData(editorState, entityKey, data))
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
        const {entityKey, contentState} = this.props
        const entity = contentState.getEntity(entityKey)
        const data = entity.getData()
        const {visible} = this.state
        let content = <div>
            <a href={data.href} target="_target" style={{marginRight: 10}}>跳转</a>
            <Icon style={{cursor: 'pointer'}} type="edit" onClick={this.handleClick}/>
        </div>
        return <span>
            <Popover content={content} trigger="click">
                <a href={data.href}>
                    {this.props.children}
                </a>
            </Popover>

            <LinkEdit
                data={data}
                visible={visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}/>
        </span>
    }
}

const ENTITY_TYPE = 'LINK'
const STATE_MAP = {
    LINK: {
        text: '链接',
        className: ''
    },
    CANCEL: {
        text: '取消链接',
        className: ''
    },
    DISABLE: {
        text: '链接',
        className: 'disabled'
    }
}
export default class Link extends React.Component {
    static propTypes = {}
    static ENTITY_TYPE = ENTITY_TYPE
    static decoratorOptions = {
        strategy: getFindEntityStrategy(ENTITY_TYPE),
        component: LinkComponent
    }
    static toHTML = function (content, entity) {
        const data = entity.getData()
        return `<a href="${data.href}" target="${data.newPage ? '_target' : '_self'}">
            ${content}
        </a>`
    }

    constructor(props) {
        super(props)
        this.state = {
            visible: false
        }
    }

    handleClick = () => {
        let currentState = this.getState()
        if (currentState === STATE_MAP.LINK) {
            this.setState({
                visible: true
            })
        } else if (currentState === STATE_MAP.CANCEL) {
            this.props.onChange(applyEntity(this.props.editorState, null))
            setTimeout(() => {
                console.log(convertToRaw(this.props.editorState.getCurrentContent()))
            }, 1000)
        }
    }
    handleCancel = () => {
        this.setState({
            visible: false
        })
    }
    handleOk = (data) => {
        let {editorState} = this.props
        this.props.onChange(applyEntity(editorState, {
            type: ENTITY_TYPE,
            immutable: 'MUTABLE',
            data
        }))
        this.setState({
            visible: false
        })
    }
    getState = () => {
        let selectionEntity = getSelectionEntity2(this.props.editorState)
        let selectionText = getSelectionText(this.props.editorState)
        let state = null
        if (selectionText && selectionEntity && selectionEntity.getType() === ENTITY_TYPE) {
            state = STATE_MAP.CANCEL
        } else if (selectionText) {
            state = STATE_MAP.LINK
        } else {
            state = STATE_MAP.DISABLE
        }
        return state
    }

    render() {
        let {visible} = this.state
        let currentState = this.getState()

        return <div className={`toolbar-btn ${currentState.className}`}
                    onClick={this.handleClick}>
            {currentState.text}
            <LinkEdit visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}/>
        </div>
    }
}