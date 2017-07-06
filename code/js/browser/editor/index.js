import React from 'react'
import {Editor} from 'react-draft-wysiwyg'
import {
    EditorState,
    convertToRaw,
    CompositeDecorator
} from 'draft-js'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import './index.less'

import Image from './extends/image'
import Link from './extends/link'
import Split from './extends/split'

import ExportHTML from './export-html'

const plugins = [Image, Link, Split]


export default class EDMEditor extends React.Component {
    static contextTypes = {
        router: React.PropTypes.object,
        store: React.PropTypes.object
    }

    constructor(props) {
        super(props)
        this.state = {
            editorState: EditorState.createEmpty()
        }
    }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState
        })
        console.log(convertToRaw(editorState.getCurrentContent()))
    }
    customBlockRenderFunc = (contentBlock) => {
        let {editorState} = this.state
        let result
        const entityKey = contentBlock.getEntityAt(0)
        if (entityKey) {
            const entity = editorState.getCurrentContent().getEntity(entityKey)
            plugins.some((Plugin) => {
                if (Plugin.customBlockRenderFunc) {
                    result = Plugin.customBlockRenderFunc({
                        editorState,
                        contentBlock,
                        onChange: this.onEditorStateChange
                    })
                    return !!result
                }
            })
            return result
        }
    }

    render() {
        let toolbar = {
            options: ['inline', 'blockType', 'textAlign', 'image'],
            inline: {
                options: ['bold', 'italic', 'underline'],

            },
            blockType: {
                options: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
            },
            textAlign: {}
        }
        let {editorState} = this.state
        let toolbarCustomButtons = [
            ...plugins.map((Plugin) => {
                return <Plugin editorState={editorState} onChange={this.onEditorStateChange}>
                </Plugin>
            }),
            <ExportHTML plugins={plugins} editorState={editorState}/>
        ]
        let self = this
        const getEditorState = () => {
            return this.state.editorState
        }
        const customDecorators = plugins
            .filter(plugin => !!plugin.decoratorOptions)
            .map((plugin) => {
                return {
                    ...plugin.decoratorOptions,
                    component: function (props) {
                        let TargetComponent = plugin.decoratorOptions.component
                        return <TargetComponent
                            {...props}
                            editorState={getEditorState()}
                            onChange={self.onEditorStateChange}
                        />
                    }
                }
            })
        return <Editor
            customBlockRenderFunc={this.customBlockRenderFunc}
            toolbarCustomButtons={toolbarCustomButtons}
            toolbar={toolbar}
            editorState={editorState}
            toolbarClassName="home-toolbar"
            wrapperClassName="home-wrapper"
            editorClassName="home-editor"
            customDecorators={customDecorators}
            onEditorStateChange={this.onEditorStateChange}>
        </Editor>
    }
}