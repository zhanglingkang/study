import React from 'react'
import {
    genKey,
    CharacterMetadata,
    ContentBlock,
    convertToRaw,
    AtomicBlockUtils
} from 'draft-js'
import {
    insertAtomicBlock,
    getEntity
} from '../../util'

import './index.less'

class SplitComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false
        }
    }

    render() {
        return <div >
            <div className="split"/>
        </div>
    }
}

const ENTITY_TYPE = 'SPLIT'
export default class Split extends React.Component {
    static propTypes = {}
    static ENTITY_TYPE = ENTITY_TYPE
    static customBlockRenderFunc = function ({editorState, contentBlock, onChange}) {
        const type = contentBlock.getType()
        const entity = getEntity(editorState, contentBlock)
        const data = entity.getData()
        if (type === 'atomic' && entity.getType() === ENTITY_TYPE) {
            return {
                component: SplitComponent,
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
        return `<div class="split"></div>`
    }

    constructor(props) {
        super(props)
    }

    handleClick = () => {
        let {editorState} = this.props
        this.props.onChange(insertAtomicBlock(editorState, {
            type: ENTITY_TYPE,
            immutable: 'IMMUTABLE',
            data: {}
        }))
    }

    render() {
        return <div className="toolbar-btn" onClick={this.handleClick}>
            分割线
        </div>
    }
}